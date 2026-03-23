
export type DebtInfo = {
  debtCount: number;
  debtAmount: number;
  status: 'AL DÍA' | 'DEUDA' | 'EXONERADO';
};

export function calculateMemberDebt(member: any, config: any): DebtInfo {
  if (member.status === 'EXONERATED') {
    return { debtCount: 0, debtAmount: 0, status: 'EXONERADO' };
  }

  // Define analysis start boundary: Jan 2026
  const startYear = 2026;
  const startMonth = 1; // 1-indexed (January)

  const entryDate = new Date(member.entryDate);
  const entryYear = entryDate.getFullYear();
  const entryMonth = entryDate.getMonth() + 1;

  // Analysis starts from Jan 2026, but only from the member's entry date if they joined later
  let currentYear = Math.max(startYear, entryYear);
  let currentMonth = (currentYear === entryYear) ? entryMonth : startMonth;

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const nowDay = now.getDate();

  // The current month is considered "due" only if today's date is >= 20.
  // Otherwise, the last fully completed month for payment is the previous one.
  let limitMonth = nowMonth;
  let limitYear = nowYear;

  if (nowDay < 20) {
    limitMonth--;
    if (limitMonth === 0) {
      limitMonth = 12;
      limitYear--;
    }
  }

  let debtCount = 0;
  
  // Iterate through each month from start boundary up to the limit month/year
  while (currentYear < limitYear || (currentYear === limitYear && currentMonth <= limitMonth)) {
    // Check if there's a non-canceled payment for this specific month/year
    const hasPayment = member.payments?.some((p: any) => 
      p.yearPaid === currentYear && 
      p.monthPaid === currentMonth && 
      p.status !== 'CANCELADO'
    );

    if (!hasPayment) {
      debtCount++;
    }

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  const fee = config?.monthlyFeeAmount || 500;
  return {
    debtCount,
    debtAmount: debtCount * fee,
    status: debtCount > 0 ? 'DEUDA' : 'AL DÍA'
  };
}
