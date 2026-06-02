<?php

namespace App\Mail;

use App\Models\PurchaseOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PurchaseOrderSentMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     * The PO is fully loaded (items.product, supplier, location) before dispatch.
     */
    public function __construct(
        public readonly PurchaseOrder $purchaseOrder
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: [
                new Address(
                    $this->purchaseOrder->supplier->email,
                    $this->purchaseOrder->supplier->name
                ),
            ],
            subject: 'Purchase Order ' . $this->purchaseOrder->po_number . ' from ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.purchase-order-sent',
            with: [
                'po'       => $this->purchaseOrder,
                'supplier' => $this->purchaseOrder->supplier,
                'location' => $this->purchaseOrder->location,
                'items'    => $this->purchaseOrder->items->load('product'),
            ],
        );
    }
}
