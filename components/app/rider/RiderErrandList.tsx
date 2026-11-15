"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RouteStops } from "@/components/dashboard/primitives";
import { errorMessage } from "@/lib/app/api";
import { errandStatus, formatDateTime, humanize, naira } from "@/lib/app/format";
import { errands } from "@/lib/app/services";
import type { Errand } from "@/lib/app/types";
import { Button, KeyValue, Modal, Notice, StatusBadge } from "../ui";
import { Detail, DetailGrid, ExpandableRow } from "../Expandable";
import { MoneyField } from "../customer/ErrandFlow";

export function RiderErrandList({ items, onChanged }: { items: Errand[]; onChanged: () => void }) {
  const [actingId, setActingId] = useState<string | null>(null);
  const [expense, setExpense] = useState<Errand | null>(null);
  const [spent, setSpent] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [expenseBusy, setExpenseBusy] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [expenseResult, setExpenseResult] = useState<{ balanceReturned?: number } | null>(null);
  const [completing, setCompleting] = useState<Errand | null>(null);
  const [completeNote, setCompleteNote] = useState("");
  const [completeBusy, setCompleteBusy] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const act = async (id: string, fn: () => Promise<{ success: boolean; message?: string }>, done: string) => {
    setActingId(id);
    try {
      const res = await fn();
      if (!res.success) throw new Error(res.message);
      toast.success(done);
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e, "We couldn't update this errand."));
    } finally {
      setActingId(null);
    }
  };

  const recordExpense = async () => {
    if (!expense) return;
    if (!(Number(spent) >= 0) || spent === "") return setExpenseError("Enter how much you spent.");
    setExpenseBusy(true);
    setExpenseError(null);
    try {
      const res = await errands.recordExpense(expense._id, { actualSpend: Number(spent), note: expenseNote.trim() || undefined });
      if (!res.success) throw new Error(res.message);
      setExpenseResult(res.data ?? {});
      onChanged();
    } catch (e) {
      setExpenseError(errorMessage(e, "We couldn't record the expense."));
    } finally {
      setExpenseBusy(false);
    }
  };

  const complete = async () => {
    if (!completing) return;
    setCompleteBusy(true);
    setCompleteError(null);
    try {
      const res = await errands.complete(completing._id, { note: completeNote.trim() || undefined });
      if (!res.success) throw new Error(res.message);
      setCompleting(null);
      toast.success("Errand marked complete. Waiting for the customer to confirm.");
      onChanged();
    } catch (e) {
      setCompleteError(errorMessage(e, "We couldn't complete this errand."));
    } finally {
      setCompleteBusy(false);
    }
  };

  return (
    <>
      <ul className="divide-y divide-brand-hairline overflow-hidden rounded-lg border border-brand-hairline">
        {items.map((e) => {
          const meta = errandStatus(e.status, true);
          const busy = actingId === e._id;
          const isPurchase = e.errandType === "PURCHASE";
          const working = e.status === "IN_PROGRESS" || e.status === "AT_PICKUP";
          return (
            <ExpandableRow
              key={e._id}
              defaultOpen={["RIDER_ASSIGNED", "ACCEPTED", "IN_PROGRESS", "AT_PICKUP"].includes(e.status)}
              summary={
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.description}</p>
                    <p className="mt-0.5 truncate text-[13px] text-brand-ink-muted">
                      {humanize(e.errandType)} · {e.pickupLocation?.address}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                    <span className="text-xs text-brand-ink-faint">{formatDateTime(e.createdAt)}</span>
                  </div>
                </div>
              }
            >
              <RouteStops pickup={e.pickupLocation?.address} dropoff={e.destination?.address ?? "No delivery destination"} />
              <div className="mt-4">
                <DetailGrid>
                  <Detail label="Task" wide>
                    {e.description}
                  </Detail>
                  {e.specialInstructions && <Detail label="Notes" wide>{e.specialInstructions}</Detail>}
                  {e.customerId?.name && (
                    <Detail label="Customer">
                      {e.customerId.name}
                      {e.customerId.phone && (
                        <>
                          {" · "}
                          <a href={`tel:${e.customerId.phone}`} className="text-brand-primary hover:underline">
                            {e.customerId.phone}
                          </a>
                        </>
                      )}
                    </Detail>
                  )}
                  {e.companyId?.name && <Detail label="Company">{e.companyId.name}</Detail>}
                  {e.spendingLimit ? <Detail label="Spending limit">{naira(e.spendingLimit)}</Detail> : null}
                  {e.customerAdvance ? <Detail label="Cash advance">{naira(e.customerAdvance)}</Detail> : null}
                  {e.actualSpend ? <Detail label="Actual spend">{naira(e.actualSpend)}</Detail> : null}
                  {e.balanceReturned ? <Detail label="Return to customer">{naira(e.balanceReturned)}</Detail> : null}
                  <Detail label="Reference">{e.referenceId}</Detail>
                </DetailGrid>
              </div>

              {e.status === "AWAITING_CONFIRMATION" && (
                <Notice tone="info" className="mt-4">
                  Waiting for the customer to confirm.{e.balanceReturned ? ` Return ${naira(e.balanceReturned)} to them.` : ""}
                </Notice>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {e.status === "RIDER_ASSIGNED" && (
                  <Button size="sm" loading={busy} onClick={() => act(e._id, () => errands.accept(e._id), "Errand accepted.")}>
                    Accept errand
                  </Button>
                )}
                {e.status === "ACCEPTED" && (
                  <Button size="sm" loading={busy} onClick={() => act(e._id, () => errands.start(e._id), "Errand started.")}>
                    Start errand
                  </Button>
                )}
                {e.status === "IN_PROGRESS" && (
                  <Button size="sm" variant="secondary" loading={busy} onClick={() => act(e._id, () => errands.atPickup(e._id), "Marked as at pickup.")}>
                    I&apos;m at the pickup
                  </Button>
                )}
                {working && isPurchase && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSpent("");
                      setExpenseNote("");
                      setExpenseError(null);
                      setExpenseResult(null);
                      setExpense(e);
                    }}
                  >
                    Record expense
                  </Button>
                )}
                {working && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setCompleteNote("");
                      setCompleteError(null);
                      setCompleting(e);
                    }}
                  >
                    Mark complete
                  </Button>
                )}
              </div>
            </ExpandableRow>
          );
        })}
      </ul>

      <Modal
        open={!!expense}
        onClose={() => !expenseBusy && setExpense(null)}
        title={expenseResult ? "Expense recorded" : "Record expense"}
        size="sm"
        footer={
          expenseResult ? (
            <Button block onClick={() => setExpense(null)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setExpense(null)} disabled={expenseBusy}>
                Cancel
              </Button>
              <Button onClick={recordExpense} loading={expenseBusy}>
                Save
              </Button>
            </>
          )
        }
      >
        {expenseResult ? (
          <div className="rounded-lg border border-brand-hairline px-4 py-1">
            <KeyValue label="You spent">{naira(spent)}</KeyValue>
            <KeyValue label="Return to customer" strong>
              {naira(expenseResult.balanceReturned)}
            </KeyValue>
          </div>
        ) : (
          <div className="space-y-4">
            <MoneyField
              id="actual-spend"
              label="Amount spent"
              value={spent}
              onChange={setSpent}
              hint={expense?.spendingLimit ? `Spending limit: ${naira(expense.spendingLimit)}` : undefined}
            />
            <div>
              <label htmlFor="expense-note" className="dash-label">
                Note <span className="font-normal text-brand-ink-faint">(optional)</span>
              </label>
              <input id="expense-note" className="dash-input" placeholder="What did you buy?" value={expenseNote} onChange={(ev) => setExpenseNote(ev.target.value)} />
            </div>
            {expenseError && <Notice tone="danger">{expenseError}</Notice>}
          </div>
        )}
      </Modal>

      <Modal
        open={!!completing}
        onClose={() => !completeBusy && setCompleting(null)}
        title="Mark errand complete"
        description="Confirm you've finished the task and handed everything to the customer."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCompleting(null)} disabled={completeBusy}>
              Not yet
            </Button>
            <Button onClick={complete} loading={completeBusy}>
              Mark complete
            </Button>
          </>
        }
      >
        <label htmlFor="complete-note" className="dash-label">
          Note <span className="font-normal text-brand-ink-faint">(optional)</span>
        </label>
        <textarea id="complete-note" className="dash-input min-h-20 resize-y" value={completeNote} onChange={(ev) => setCompleteNote(ev.target.value)} />
        {completeError && (
          <Notice tone="danger" className="mt-3">
            {completeError}
          </Notice>
        )}
      </Modal>
    </>
  );
}
