<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order {{ $po->po_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; color: #0F172A; font-size: 14px; line-height: 1.6; }
        .wrapper { max-width: 680px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .header { background: #1B4FD8; padding: 32px 40px; }
        .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
        .header p { color: #93C5FD; font-size: 13px; margin-top: 4px; }
        .body { padding: 36px 40px; }
        .po-number { display: inline-block; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #1B4FD8; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 6px 16px; border-radius: 8px; margin-bottom: 24px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; padding: 20px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; }
        .meta-item label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: #64748B; margin-bottom: 3px; }
        .meta-item span { font-size: 14px; font-weight: 500; color: #0F172A; }
        .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
        thead th { background: #F1F5F9; text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B; border-bottom: 2px solid #E2E8F0; }
        thead th:not(:first-child) { text-align: right; }
        tbody td { padding: 12px 14px; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #334155; vertical-align: middle; }
        tbody td:not(:first-child) { text-align: right; }
        tbody td.sku { font-family: 'Courier New', monospace; font-size: 12px; color: #1B4FD8; background: #EFF6FF; padding: 2px 8px; border-radius: 4px; display: inline-block; }
        .total-row td { padding: 14px; font-weight: 700; font-size: 14px; background: #F8FAFC; border-top: 2px solid #E2E8F0; border-bottom: none; }
        .notes-block { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 16px; margin-bottom: 28px; }
        .notes-block p { font-size: 13px; color: #92400E; }
        .footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 40px; text-align: center; }
        .footer p { font-size: 12px; color: #94A3B8; line-height: 1.8; }
        .footer strong { color: #475569; }
    </style>
</head>
<body>
<div class="wrapper">

    {{-- Header --}}
    <div class="header">
        <h1>{{ config('app.name') }}</h1>
        <p>Purchase Order Confirmation</p>
    </div>

    <div class="body">

        {{-- PO Number --}}
        <div class="po-number">{{ $po->po_number }}</div>

        {{-- Meta grid --}}
        <div class="meta-grid">
            <div class="meta-item">
                <label>Supplier</label>
                <span>{{ $supplier->name }}</span>
            </div>
            <div class="meta-item">
                <label>Destination</label>
                <span>{{ $location->name }} ({{ $location->code }})</span>
            </div>
            <div class="meta-item">
                <label>Issue Date</label>
                <span>{{ $po->created_at->format('d M Y') }}</span>
            </div>
            <div class="meta-item">
                <label>Expected Delivery</label>
                <span>{{ $po->expected_at ? $po->expected_at->format('d M Y') : 'Not specified' }}</span>
            </div>
        </div>

        {{-- Line items table --}}
        <p class="section-title">Order Items</p>
        <table>
            <thead>
                <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Qty Ordered</th>
                    <th>Unit Cost</th>
                    <th>Line Total</th>
                </tr>
            </thead>
            <tbody>
                @php $grandTotal = 0; @endphp
                @foreach ($items as $item)
                    @php
                        $lineTotal = (float) $item->qty_ordered * (float) $item->unit_cost;
                        $grandTotal += $lineTotal;
                    @endphp
                    <tr>
                        <td><span class="sku">{{ $item->product->sku }}</span></td>
                        <td>{{ $item->product->name }}</td>
                        <td>{{ number_format((float) $item->qty_ordered, 3, '.', ',') }} {{ $item->product->unit }}</td>
                        <td>{{ number_format((float) $item->unit_cost, 2, '.', ',') }}</td>
                        <td>{{ number_format($lineTotal, 2, '.', ',') }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="4" style="text-align: right;">Grand Total</td>
                    <td>{{ number_format($grandTotal, 2, '.', ',') }}</td>
                </tr>
            </tbody>
        </table>

        {{-- Notes --}}
        @if ($po->notes)
        <div class="notes-block">
            <p><strong>Order Notes:</strong> {{ $po->notes }}</p>
        </div>
        @endif

    </div>

    {{-- Footer --}}
    <div class="footer">
        <p>
            Please confirm receipt of this purchase order by replying to this email.<br>
            <strong>{{ config('app.name') }}</strong> · This is an automated message.
        </p>
    </div>

</div>
</body>
</html>
