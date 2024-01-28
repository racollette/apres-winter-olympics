import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export const buildAuthTx = (nonce: string): Transaction => {
  const tx = new Transaction();
  tx.add(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(nonce, "utf8"),
    })
  );
  return tx;
};

export const validateAuthTx = (tx: Transaction, nonce: string): boolean => {
  try {
    const inx = tx.instructions[2];
    if (!inx?.programId.equals(MEMO_PROGRAM_ID)) return false;
    if (inx.data.toString() != nonce) return false;
    if (!tx.verifySignatures()) return false;
  } catch (e) {
    return false;
  }
  return true;
};
