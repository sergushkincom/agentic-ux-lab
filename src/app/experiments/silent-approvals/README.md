# Silent approvals

**The question:** one flow that stops and waits for a person is honest. When forty are
waiting, how does a person approve by what would happen, not one by one?

Route: `/experiments/silent-approvals`

## What it is

Forty flows have stopped and each one asks the same thing: please confirm. The screen
shows the same forty in two arrangements. By arrival is the queue as it usually looks:
forty cards with the same two buttons. By what would happen sorts them into four
effects: something is deleted for good, money leaves the company, a customer gets a
message, a date in an order changes.

Each group takes one decision. The five items that are not like the rest of their
group sit outside that decision, each with the reason. A counter above shows how many
decisions are left in the current arrangement: 40 by arrival, 9 by what would happen.

Everything is scripted. There is no model, and nothing is paid, sent, moved or deleted.

## Four decisions I'd defend

**1. A group is named by its effect, and the hardest to take back comes first.**
The heading is not "Invoices" or "Finance". It is "Money leaves the company". Next to it
is one line on taking it back: until the bank run at 16:00, never, at any time. Arrival
time does not order anything in this view.

**2. The button says what will happen.**
"Pay 12 invoices · €47,130", "Delete 4 supplier records for good". There is no button
labelled Approve in the grouped view. The count and the sum on the button change when
an item leaves the group.

**3. An exception is never inside the group decision.**
An invoice at six times the supplier's usual amount, a supplier whose bank details
changed two days ago, a customer with an open complaint: each is shown with its reason
and gets its own decision. A person can take any other item out of a group too, and
put back only the ones they took out themselves.

**4. Undo is offered only where the effect can be taken back.**
A payment can be undone until the bank run, a date can be changed back. A sent notice
and a deleted record show "No undo". Sending something back to its flow can always be
undone, because nothing happened.

## Deliberately not built

A model that decides what counts as an exception · confidence scores · standing rules
such as "always approve these" · delegation to another person · notifications ·
search, filters and sorting · a real payment, message, order change or deletion ·
accounts · real people or companies.

Each of those is a real feature. None of them is required to see whether a person can
clear forty waiting flows in nine decisions and still catch the five that needed a look.

## Running it

```bash
npm run dev
# → http://localhost:3000/experiments/silent-approvals

npm test
```
