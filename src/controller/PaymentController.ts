import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Class from "../model/Class";
import Payment from "../model/Payment";
import User from "../model/User";
const stripe = require("stripe")(
  "sk_test_51Q41aIECDhAPkwcwgbTyyOiJheSAaAnOROqMKQmRDqLJX8zflpvzZlcjLlGkLcw5eyRXGOGVTNhqezlZbJnTemuG003LIXjOa5"
);

const DOMAIN = "http://localhost:3300/api";
const initiateKhalti = async (formData: any, req: Request, res: Response) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    };

    console.log({ key: process.env.KHALTI_SECRET_KEY });

    console.log({ here: formData });
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      JSON.stringify(formData),
      { headers }
    );

    console.log({ response });

    formatApiResponse(response.data, 1, "success", res?.status(200));

    // res.json({ message: "success", data: response.data });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ error: error.message });
  }
};

const verifyKhalti = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { txnId, pidx, amount, purchase_order_id, transaction_id, message } =
    req.query;
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    };
    const response = await axios.post(
      `https://khalti.com/api/v2/payment/verify/`,
      { pidx },
      {
        headers,
      }
    );

    if (response.data.status !== "Completed") {
      return res.status(400).json({ message: "Payment failed" });
    }

    req.body.data = req.query;

    return res.status(200).json({ message: "Payment successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const initiateStripe = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const roles = req.roles;
  const isStudent = roles?.includes("Student");
  const { amount, classId } = req.body;
  const classData: any = await Class.findByPk(classId);
  if (!isStudent) {
    formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
    return;
  }
  if (!classData) {
    formatApiResponse(null, 0, "Class not found", res?.status(404));
    return;
  }

  const classAlredyFull = await Class.findOne({
    where: {
      id: classId,
      joinedUser: {
        [Op.not]: null,
      },
    },
  });
  console.log(classAlredyFull);

  if (classAlredyFull) {
    formatApiResponse(null, 0, "Class is already full", res?.status(400));
    return;
  }

  const enrolledUser = await Class.findOne({
    where: {
      joinedUser: user.id,
      id: classId,
    },
  });
  if (enrolledUser) {
    formatApiResponse(
      null,
      0,
      "You have already joined this class",
      res?.status(400)
    );
    return;
  }
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "npr",
            product_data: {
              name: `${classId}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      mode: "payment",
      success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/cancel`,
    });
    // return res.redirect(303, session.url);
    res.json({ id: session.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const paymentSuccess = async (req: Request, res: Response) => {
  const result = await stripe.checkout.sessions.retrieve(req.query.session_id, {
    expand: ["payment_intent.payment_method"],
  });
  const product = await stripe.checkout.sessions.listLineItems(
    req.query.session_id
  );
  await Class.update(
    { joinedUser: result?.client_reference_id },
    {
      where: {
        id: product?.data[0].description,
      },
    }
  );
  await Payment.create({
    txnId: result?.id,
    classId: Number(product?.data[0].description),
    userId: Number(result?.client_reference_id),
    amount: product?.data[0].amount_total,
    paymentMethod: "Stripe",
    status: "success",
  });
  return res.redirect("http://localhost:9001/success");
};

const getAllPayments = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  if (!user.isAdmin) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Class,
          attributes: ["title"],
          include: [
            {
              model: User,
              attributes: ["first_name", "last_name", "middle_name", "id"],
            },
          ],
        },
        {
          model: User,
          attributes: ["first_name", "last_name", "middle_name", "id"],
        },
      ],
    });
    return formatApiResponse(
      payments,
      1,
      "Payments fetched successfully",
      res.status(200)
    );
  } catch (error) {
    return formatApiResponse(null, 0, error.message, res.status(400));
  }
};

export {
  getAllPayments,
  initiateKhalti,
  initiateStripe,
  paymentSuccess,
  verifyKhalti,
};
