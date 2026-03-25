import { NextResponse } from "next/server";

export async function GET() {
  const holders = [
    { rank: 1, wallet_address: "8x9...4V", balance: 842000 },
    { rank: 2, wallet_address: "BrainWallet...SOL", balance: 612400 },
    { rank: 3, wallet_address: "7r9...BAGS", balance: 320000 },
    { rank: 4, wallet_address: "Degen...X1", balance: 150000 },
    { rank: 5, wallet_address: "Fren...LUV", balance: 90000 },
  ];

  return NextResponse.json(holders);
}
