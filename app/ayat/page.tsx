import Footer from "@/components/Footer";
import Header from "@/components/Header";

function Ayat() {
  return (
    <>
      <Header />
      <h1>Ayat</h1>
      <img src="${TripsData[i].imageUrl}" className="card-img-top" alt="${TripsData[i].name}" />
      <div className="card-body">
        <h5 className="card-title">TripsData[i].name</h5>
        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card&#39;s content.</p>
        <button type="button" className="btn-information" data-bs-toggle="modal" data-bs-target="#info${[i]}" data-bs-whatever="@Tofa7a">
          More Detalis
        </button>
        <div
          className="modal fade"
          id="info${[i]}"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex={-1}
          aria-labelledby="infoLabel${[i]}"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="infoLabel1">TripsData[i].name University</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <img src="${TripsData[i].imageUrl}" className="card-img-top" alt="${TripsData[i].name}" />
                <table className="table">
                  <thead className="table-primary">
                    <td colSpan={4} className="text-center bg-secondary">From Your city To TripsData[i].name Univeristy</td>
                    <tr>
                      <th>Time to Leave</th>
                      <th>Time to Reach</th>
                      <th>Duration</th>
                      <th>Statue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>TripsData[i].timeFCTU1[0]</td>
                      <td>TripsData[i].timeFCTU1[1]</td>
                      <td>TripsData[i].timeFCTU1[2] Hourse</td>
                      <td>
                        <input type="radio" id="firstF" name="tripTimeF" value="firstF" />
                        <label htmlFor="firstF">OK</label>
                      </td>
                    </tr>
                    <tr>
                      <td>TripsData[i].timeFCTU2[0]</td>
                      <td>TripsData[i].timeFCTU2[1]</td>
                      <td>TripsData[i].timeFCTU2[2] Hourse</td>
                      <td>
                        <input type="radio" id="secondF" name="tripTimeF" value="secondF" />
                        <label htmlFor="secondF">OK</label>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="table">
                  <thead className="table-info">
                    <td colSpan={4} className="text-center bg-secondary">From TripsData[i].name Univeristy To Your City</td>
                    <tr>
                      <th>Time to Leave</th>
                      <th>Time to Reach</th>
                      <th>Duration</th>
                      <th>Statue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>TripsData[i].timeFUTC1[0]</td>
                      <td>TripsData[i].timeFUTC1[1]</td>
                      <td>TripsData[i].timeFUTC1[2] Hourse</td>
                      <td>
                        <input type="radio" id="firstT" name="tripTimeT" value="firstT" />
                        <label htmlFor="firstT">OK</label>
                      </td>
                    </tr>
                    <tr>
                      <td>TripsData[i].timeFUTC2[0]</td>
                      <td>TripsData[i].timeFUTC2[1] PM</td>
                      <td>TripsData[i].timeFUTC2[2] Hourse</td>
                      <td>
                        <input type="radio" id="secondT" name="tripTimeT" value="secondT" />
                        <label htmlFor="secondT">OK</label>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <hr />
                <form>
                  <div className="mb-3">
                    <label htmlFor="recipient-name" className="col-form-label">Recipient:</label>
                    <input type="text" className="form-control" id="recipient-name" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="message-text" className="col-form-label">Message:</label>
                    <textarea className="form-control" id="message-text"></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button className="btn-information" data-bs-target="#payment${[i]}" data-bs-toggle="modal">Open Payment</button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal fade" id="payment${[i]}" aria-hidden="true" aria-labelledby="paymentLabel${[i]}" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="paymentLabel${[i]}">Modal 2</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <h4 className="mb-3">Payment TripsData[i].payment LE</h4>

                <div className="my-3">
                  <div className="form-check">
                    <input id="credit" name="paymentMethod" type="radio" className="form-check-input" checked required />
                    <label className="form-check-label" htmlFor="credit">Credit card</label>
                  </div>
                  <div className="form-check">
                    <input id="debit" name="paymentMethod" type="radio" className="form-check-input" required />
                    <label className="form-check-label" htmlFor="debit">Debit card</label>
                  </div>
                  <div className="form-check">
                    <input id="paypal" name="paymentMethod" type="radio" className="form-check-input" required />
                    <label className="form-check-label" htmlFor="paypal">PayPal</label>
                  </div>
                </div>

                <div className="row gy-3">
                  <div className="col-md-6">
                    <label htmlFor="cc-name" className="form-label">Name on card</label>
                    <input type="text" className="form-control" id="cc-name" placeholder="" required />
                    <small className="text-body-secondary">Full name as displayed on card</small>
                    <div className="invalid-feedback">Name on card is required</div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="cc-number" className="form-label">Credit card number</label>
                    <input type="text" className="form-control" id="cc-number" placeholder="" required />
                    <div className="invalid-feedback">Credit card number is required</div>
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="cc-expiration" className="form-label">Expiration</label>
                    <input type="text" className="form-control" id="cc-expiration" placeholder="" required />
                    <div className="invalid-feedback">Expiration date required</div>
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="cc-cvv" className="form-label">CVV</label>
                    <input type="text" className="form-control" id="cc-cvv" placeholder="" required />
                    <div className="invalid-feedback">Security code required</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-target="#info${[i]}" data-bs-whatever="@Tofa7a" data-bs-toggle="modal">
                  Back to Informations
                </button>
                <button
                  className="btn-information"
                  data-bs-target="#submit${[i]}"
                  data-bs-whatever="@Tofa7a"
                  data-bs-nameUni="${TripsData[i].name} University"
                  data-bs-toggle="modal"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal fade" id="submit${[i]}" aria-hidden="true" aria-labelledby="submitLabel${[i]}" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="submitLabel${[i]}">Modal [i]</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <h3></h3>
              </div>
            </div>
            <div className="modal-footer">
              {/* <button className="btn btn-secondary" data-bs-target="#info${[i]}" data-bs-whatever="@Tofa7a" data-bs-toggle="modal">
                Back to first
              </button>
              <button className="btn-information" data-bs-target="#info" data-bs-whatever="@Tofa7a" data-bs-nameUni="${
                    TripsData[i].name
                  } University" data-bs-toggle="modal">
                Submit
              </button> */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Ayat;

