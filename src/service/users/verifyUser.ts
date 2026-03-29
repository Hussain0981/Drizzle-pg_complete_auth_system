import { db } from "../../config/dbConnection";
import { usersOtp } from "../../db/schema/users";
import { compareData } from '../../utils/auth';
import { eq } from "drizzle-orm";

export async function verifyUser(userId: number, inputOtp: string) {
  const otpRecord = await db.query.usersOtp.findFirst({
    where: eq(usersOtp.userId, userId),
  });

  if (!otpRecord) throw new Error("OTP not found");

  const now = new Date();

  if (now > otpRecord.otpExpiry) {
    throw new Error("OTP expire ho gaya");
  }

  const isMatch = await compareData(inputOtp, otpRecord.hashedOtp);

  if (!isMatch) {
    throw new Error('Your otp is not correct')
  }

  await db.update(usersOtp)
    .set({
      temporaryBlock: false,
      blockedUntil: null,
      retryAttempts: 0,
      isVerified: true
    })
    .where(eq(usersOtp.userId, userId));

  return "OTP verified"
}