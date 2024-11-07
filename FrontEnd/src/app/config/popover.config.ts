import { Provider } from '@angular/core';
import { NGX_POPOVER_CONFIG, NgxPopoverConfig } from '@ngx-popovers/popover';
import {hide, offset, autoPlacement} from '@floating-ui/dom';

export const PopoverConfigProvider: Provider = {
  provide: NGX_POPOVER_CONFIG,
  useValue: new NgxPopoverConfig({
    arrow: true,
    closeOnClickedOutside: true,
    middleware: [autoPlacement(),
        offset(4),
        hide()
      ]
  })
};