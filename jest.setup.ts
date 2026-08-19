import '@testing-library/jest-dom';

if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = jest.fn(function showModal(
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });

  HTMLDialogElement.prototype.close = jest.fn(function close(
    this: HTMLDialogElement,
  ) {
    this.open = false;
  });
}
