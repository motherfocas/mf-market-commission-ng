import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { DatePipe } from '@angular/common';

// ngx-bootstrap imports
import { ModalDirective } from 'ngx-bootstrap/modal/index';

// entity imports
import { Purchase } from '../purchase';
import { Item } from '../item';

// animation
import { trigger, state, animate, style, transition } from '@angular/animations'

@Component({
    selector: 'app-purchases',
    templateUrl: './purchases.component.html',
    styleUrls: ['./purchases.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: '0' }),
                animate('.6s ease-out', style({ opacity: '1' })),
            ]),
        ]),
    ]
})
export class PurchasesComponent implements OnInit {
    @ViewChild('newPurchaseModal') public modalNewPurchase: ModalDirective;
    @ViewChild('showDetailModal') public modalPurchaseDetail: ModalDirective;

    public purchases: Array<Purchase> = [];
    public newPurchase: Purchase = new Purchase();
    public newItem: Item = new Item();
    public listLoading = true;
    public selectedPurchase: Purchase;
    public creatingNewPurchase = false;

    constructor(public api: ApiService) {
    }

    ngOnInit() {
        this.getPurchases();
    }

    getPurchases() {
        this.api.get('/purchase/').then(response => {
            this.listLoading = false;
            // Sort purchases by date
            this.purchases = response['purchases'].sort(function (a, b) {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
        });
    }

    showNewPurchaseModal() {
        this.modalNewPurchase.show();
    }

    showPurchaseDetailModal(purchase: Purchase) {
        this.selectedPurchase = purchase;
        this.modalPurchaseDetail.show();
    }

    addItem() {
        if (!this.newPurchase.items) {
            this.newPurchase.items = new Array<Item>();
        }
        this.newPurchase.items.push(this.newItem);
        this.newItem = new Item();
    }

    confirmNewPurchase() {
        this.creatingNewPurchase = true;
        this.api.post('/purchase/', this.newPurchase).then(response => {
            this.modalNewPurchase.hide();
            this.resetNewPurchase();
            this.getPurchases();
        });
    }

    deletePurchase(purchase: Purchase) {
        this.api.delete('/purchase/' + purchase.id + '/').then(response => {
            if (response) {
                this.modalPurchaseDetail.hide();
                this.getPurchases();
            } else {
                // No se ha podido borrar
            }
        });
    }

    resetNewPurchase() {
        this.newPurchase = new Purchase();
        this.creatingNewPurchase = false;
    }

    startEditingItem(item: Item) {
        // TODO
    }

    removeItem(i: Item) {
        this.selectedPurchase.items = this.selectedPurchase.items.filter(item => item.id !== i.id);
        // Recalculate total amount...
        this.selectedPurchase.total_price -= i.price;
    }

    confirmPurchaseEdition(purchase: Purchase) {
        this.api.patch('/purchase/' + purchase.id + '/', purchase).then(response => {
            if (response) {
                this.modalPurchaseDetail.hide();
                this.getPurchases();
            } else {
                // No se ha podido borrar
            }
        });
    }
}
