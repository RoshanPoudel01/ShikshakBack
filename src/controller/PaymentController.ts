import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";

interface IFormData {
  return_url: string;
  website_url: string;
  amount: number | string;
  purchase_order_id: string | number;
  purchase_order_name: string;
}

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

export { initiateKhalti, verifyKhalti };
