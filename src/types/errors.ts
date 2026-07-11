/** Thrown when book_seat RPC returns false or fails — trip has no remaining seats. */
export class SeatsFullError extends Error {
  constructor(message = 'SEATS_FULL') {
    super(message)
    this.name = 'SeatsFullError'
  }
}
