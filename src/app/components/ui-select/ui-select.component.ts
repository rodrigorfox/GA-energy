import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormFieldBaseDirective } from '../abstract-classes/form-field-base';
import { SelectOptions } from 'src/app';

@Component({
  selector: 'app-ui-select',
  templateUrl: './ui-select.component.html',
  styleUrls: ['./ui-select.component.scss'],
  providers: [     
    {       
      provide: NG_VALUE_ACCESSOR, 
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true     
    }   
  ]
})
export class UiSelectComponent extends FormFieldBaseDirective {
  @Input() options: Array<SelectOptions> = [];
  @Input() isMultiple?: boolean = false;

  constructor() { 
    super();
  }

}
