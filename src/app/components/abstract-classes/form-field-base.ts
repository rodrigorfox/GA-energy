import { Directive, Input, OnInit } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";

@Directive()
export abstract class FormFieldBaseDirective implements OnInit, ControlValueAccessor {
    id!: number;
    val: any;
    @Input() label!: string;
    @Input() placeholder!: string;
    @Input() disabled: boolean = false;
    @Input() error: string = 'Preencha o campo';
    @Input() showError: boolean = false;

    constructor() { }

    ngOnInit(): void {
        this.createRandomId();
    }

    onChange: any = () => { }
    onTouch: any = () => { }

    set value(val: any) {
        if (val !== undefined && this.val !== val) {
            this.val = val
            this.onChange(val)
            this.onTouch(val)
        }
    }
    // this method sets the value programmatically
    writeValue(value: any) {
        this.value = value
    }
    // upon UI element value changes, this method gets triggered
    registerOnChange(fn: any) {
        this.onChange = fn
    }
    // upon touching the element, this method gets triggered
    registerOnTouched(fn: any) {
        this.onTouch = fn
    }

    createRandomId(): void {
        this.id = Math.floor(Math.random() * 10000);
    }
}