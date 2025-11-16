import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otp-input.html',
  styleUrl: './otp-input.css'
})
export class OtpInputComponent {

  @Input() length = 6;
  @Output() codeChange = new EventEmitter<string>();
  @Output() completed = new EventEmitter<string>();

  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = [];

  constructor() {
    this.digits = Array(this.length).fill('');
  }

  ngOnChanges(): void {
    this.digits = Array(this.length).fill('');
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = (input.value || '').replace(/\D/g, '');

    if (!value) {
      this.digits[index] = '';
      this.emitCode();
      return;
    }

    this.digits[index] = value[value.length - 1];
    input.value = this.digits[index];

    if (index < this.length - 1) {
      this.focusIndex(index + 1);
    } else {
      input.blur();
    }

    this.emitCode();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const key = event.key;

    if (key === 'Backspace' && !this.digits[index] && index > 0) {
      this.focusIndex(index - 1);
    }

    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusIndex(index - 1);
    }

    if (key === 'ArrowRight' && index < this.length - 1) {
      event.preventDefault();
      this.focusIndex(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const data = event.clipboardData?.getData('text') ?? '';
    const onlyDigits = data.replace(/\D/g, '').slice(0, this.length);

    this.digits = Array(this.length).fill('');
    for (let i = 0; i < onlyDigits.length; i++) {
      this.digits[i] = onlyDigits[i];
    }

    this.inputs.forEach((ref, i) => {
      ref.nativeElement.value = this.digits[i] ?? '';
    });

    this.emitCode();
  }

  private focusIndex(index: number): void {
    const arr = this.inputs.toArray();
    if (arr[index]) {
      arr[index].nativeElement.focus();
      arr[index].nativeElement.select();
    }
  }

  private emitCode(): void {
    const code = this.digits.join('');
    this.codeChange.emit(code);
    if (code.length === this.length && !code.includes('')) {
      this.completed.emit(code);
    }
  }
}
