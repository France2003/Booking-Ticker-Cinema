import crypto from "crypto";
import qs from "qs";

const vnp_TmnCode = process.env.VNP_TMNCODE!;
const vnp_HashSecret = process.env.VNP_HASHSECRET!;
const vnp_Url = process.env.VNP_URL!;
const vnp_ReturnUrl = process.env.VNP_RETURNURL!;

/**
 * Tạo URL thanh toán VNPay
 */
export function buildVNPayUrl(
    bookingCode: string,
    total: number,
    ipAddr: string
) {
    const date = new Date();
    const createDate = date.toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

    let params: Record<string, string> = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode,
        vnp_Amount: (total * 100).toString(),
        vnp_CurrCode: "VND",
        vnp_TxnRef: bookingCode,
        vnp_OrderInfo: `Thanh toán vé xem phim ${bookingCode}`,
        vnp_OrderType: "billpayment",
        vnp_ReturnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_Locale: "vn",
    };

    const signData = qs.stringify(params, { encode: false });
    const secureHash = crypto
        .createHmac("sha512", vnp_HashSecret)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

    params["vnp_SecureHash"] = secureHash;
    return `${vnp_Url}?${qs.stringify(params, { encode: true })}`;
}

/**
 * Xác minh chữ ký callback từ VNPay
 */
export function verifyVNPay(query: Record<string, string | string[]>) {
    const secureHash = query["vnp_SecureHash"];
    delete query["vnp_SecureHash"];
    delete query["vnp_SecureHashType"];

    const signData = qs.stringify(query, { encode: false });
    const signed = crypto
        .createHmac("sha512", vnp_HashSecret)
        .update(Buffer.from(signData, "utf-8"))
        .digest("hex");

    return secureHash === signed;
}
