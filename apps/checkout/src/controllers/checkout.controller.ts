import { FastifyRequest, FastifyReply } from 'fastify';
import { fetch } from 'undici';

const API = process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000';

export async function getCheckoutPage(req: FastifyRequest, reply: FastifyReply) {
  const { order_id, token } = req.query as any;

  if (!order_id || !token) {
    return reply.status(400).send('Missing order_id or token');
  }

  // Fetch order details
  const res = await fetch(`${API}/orders/${order_id}`, {
    headers: { authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    return reply.status(404).send('Order not found');
  }

  const order = await res.json() as any;

  // Send checkout page with order data injected
  return reply.type('text/html').send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payflow Checkout</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .card {
      background: white;
      border-radius: 20px;
      width: 100%;
      max-width: 420px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    }

    .card-header {
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      padding: 28px 30px;
      color: white;
    }

    .logo {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #e94560;
      margin-bottom: 16px;
    }

    .logo span { color: white; }

    .order-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .amount {
      font-size: 36px;
      font-weight: 700;
      color: white;
    }

    .amount small {
      font-size: 16px;
      color: #aaa;
      margin-right: 4px;
    }

    .order-id {
      font-size: 12px;
      color: #aaa;
      margin-top: 6px;
    }

    .secure-badge {
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      color: #4caf50;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .card-body { padding: 30px; }

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 14px;
    }

    .methods {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 24px;
    }

    .method-btn {
      border: 2px solid #e8e8e8;
      border-radius: 12px;
      padding: 14px 10px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      background: white;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    .method-btn:hover { border-color: #0f3460; background: #f0f4ff; }

    .method-btn.active {
      border-color: #e94560;
      background: #fff0f3;
      color: #e94560;
    }

    .method-btn .icon { font-size: 22px; display: block; margin-bottom: 5px; }

    .input-group { margin-bottom: 16px; }

    .input-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #555;
      margin-bottom: 6px;
    }

    .input-group input {
      width: 100%;
      padding: 13px 16px;
      border: 2px solid #e8e8e8;
      border-radius: 10px;
      font-size: 15px;
      transition: border 0.2s;
      outline: none;
    }

    .input-group input:focus { border-color: #0f3460; }

    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .pay-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #e94560, #c0392b);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 8px;
      letter-spacing: 0.5px;
    }

    .pay-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(233,69,96,0.4); }
    .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .upi-input { display: none; }
    .upi-input.show { display: block; }
    .card-inputs { display: none; }
    .card-inputs.show { display: block; }
    .wallet-input { display: none; }
    .wallet-input.show { display: block; }
    .crypto-input { display: none; }
    .crypto-input.show { display: block; }

    .footer {
      text-align: center;
      padding: 16px 30px 24px;
      font-size: 12px;
      color: #aaa;
    }

    .spinner {
      display: none;
      width: 20px; height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <div class="logo">PAY<span>FLOW</span></div>
      <div class="order-info">
        <div>
          <div class="amount">
            <small>₹</small>${(order.amount / 100).toFixed(2)}
          </div>
          <div class="order-id">Order: ${order.id || order.order_id}</div>
        </div>
        <div class="secure-badge">🔒 Secure</div>
      </div>
    </div>

    <div class="card-body">
      <div class="section-title">Choose Payment Method</div>

      <div class="methods">
        <button class="method-btn active" onclick="selectMethod('upi', this)">
          <span class="icon">📱</span> UPI
        </button>
        <button class="method-btn" onclick="selectMethod('card', this)">
          <span class="icon">💳</span> Card
        </button>
        <button class="method-btn" onclick="selectMethod('wallet', this)">
          <span class="icon">👛</span> Wallet
        </button>
        <button class="method-btn" onclick="selectMethod('netbanking', this)">
          <span class="icon">🏦</span> Netbanking
        </button>
      </div>

      <!-- UPI -->
      <div class="upi-input show" id="upi-section">
        <div class="input-group">
          <label>UPI ID</label>
          <input type="text" id="upi-id" placeholder="yourname@upi" />
        </div>
      </div>

      <!-- Card -->
      <div class="card-inputs" id="card-section">
        <div class="input-group">
          <label>Card Number</label>
          <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" />
        </div>
        <div class="input-group">
          <label>Cardholder Name</label>
          <input type="text" id="card-name" placeholder="Name on card" />
        </div>
        <div class="input-row">
          <div class="input-group">
            <label>Expiry</label>
            <input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5" />
          </div>
          <div class="input-group">
            <label>CVV</label>
            <input type="password" id="card-cvv" placeholder="•••" maxlength="3" />
          </div>
        </div>
      </div>

      <!-- Wallet -->
      <div class="wallet-input" id="wallet-section">
        <div class="input-group">
          <label>Select Wallet</label>
          <select style="width:100%;padding:13px 16px;border:2px solid #e8e8e8;border-radius:10px;font-size:15px;outline:none;">
            <option>Paytm</option>
            <option>PhonePe</option>
            <option>Amazon Pay</option>
            <option>Mobikwik</option>
          </select>
        </div>
      </div>

      <!-- Netbanking -->
      <div id="netbanking-section" style="display:none">
        <div class="input-group">
          <label>Select Bank</label>
          <select style="width:100%;padding:13px 16px;border:2px solid #e8e8e8;border-radius:10px;font-size:15px;outline:none;">
            <option>SBI</option>
            <option>HDFC Bank</option>
            <option>ICICI Bank</option>
            <option>Axis Bank</option>
            <option>Kotak Bank</option>
          </select>
        </div>
      </div>

      <button class="pay-btn" id="pay-btn" onclick="processPayment()">
        <span id="btn-text">Pay ₹${(order.amount / 100).toFixed(2)}</span>
        <div class="spinner" id="spinner"></div>
      </button>
    </div>

    <div class="footer">🔒 256-bit SSL encrypted · Powered by Payflow</div>
  </div>

  <script>
    let selectedMethod = 'upi';
    const orderId = '${order.id || order.order_id}';
    const token = '${token}';

    function selectMethod(method, el) {
      selectedMethod = method;
      document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');

      // Hide all sections
      document.getElementById('upi-section').classList.remove('show');
      document.getElementById('card-section').classList.remove('show');
      document.getElementById('wallet-section').classList.remove('show');
      document.getElementById('netbanking-section').style.display = 'none';

      // Show selected
      if (method === 'upi') document.getElementById('upi-section').classList.add('show');
      if (method === 'card') document.getElementById('card-section').classList.add('show');
      if (method === 'wallet') document.getElementById('wallet-section').classList.add('show');
      if (method === 'netbanking') document.getElementById('netbanking-section').style.display = 'block';
    }

    async function processPayment() {
      const btn = document.getElementById('pay-btn');
      const spinner = document.getElementById('spinner');
      const btnText = document.getElementById('btn-text');

      btn.disabled = true;
      btnText.style.display = 'none';
      spinner.style.display = 'block';

      try {
        const res = await fetch('/checkout/pay', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            method: selectedMethod,
            token: token,
            idempotency_key: 'checkout-' + Date.now()
          })
        });

        const data = await res.json();

        if (data.status === 'captured') {
          window.location.href = '/checkout/success?payment_id=' + data.payment_id + '&amount=${(order.amount / 100).toFixed(2)}';
        } else {
          window.location.href = '/checkout/failed?reason=' + encodeURIComponent(data.error || 'Payment failed');
        }
      } catch (err) {
        window.location.href = '/checkout/failed?reason=Network+error';
      }
    }

    // Format card number
    document.addEventListener('DOMContentLoaded', () => {
      const cardInput = document.getElementById('card-number');
      if (cardInput) {
        cardInput.addEventListener('input', (e) => {
          let val = e.target.value.replace(/\\D/g, '').substring(0, 16);
          e.target.value = val.replace(/(\\d{4})/g, '$1 ').trim();
        });
      }
    });
  </script>
</body>
</html>
  `);
}

export async function processPayment(req: FastifyRequest, reply: FastifyReply) {
  const { order_id, method, token, idempotency_key } = req.body as any;

  const API = process.env.API_GATEWAY_URL || 'http://127.0.0.1:3000';

  try {
    const res = await fetch(`${API}/payments/initiate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${token}`,
        'idempotency-key': idempotency_key
      },
      body: JSON.stringify({ order_id, method })
    });

    const data = await res.json() as any;

    if (!res.ok) {
      return reply.status(400).send({ error: data.error || 'Payment failed' });
    }

    return reply.send(data);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}

export async function successPage(req: FastifyRequest, reply: FastifyReply) {
  const { payment_id, amount } = req.query as any;

  return reply.type('text/html').send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Successful</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 50px 40px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    }
    .icon {
      width: 80px; height: 80px;
      background: #e8f8ef;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 36px;
      animation: pop 0.4s ease;
    }
    @keyframes pop {
      0% { transform: scale(0); }
      70% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    h1 { font-size: 26px; color: #1a1a2e; margin-bottom: 8px; }
    .amount { font-size: 40px; font-weight: 800; color: #2d6a4f; margin: 16px 0; }
    .payment-id { font-size: 12px; color: #aaa; margin-bottom: 30px; word-break: break-all; }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      color: white;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
    }
    .logo { font-size: 14px; color: #aaa; margin-top: 24px; }
    .logo span { color: #e94560; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Payment Successful!</h1>
    <div class="amount">₹${amount}</div>
    <div class="payment-id">Payment ID: ${payment_id}</div>
    <a href="#" class="btn">Back to Store</a>
    <div class="logo">Powered by <span>PAYFLOW</span></div>
  </div>
</body>
</html>
  `);
}

export async function failedPage(req: FastifyRequest, reply: FastifyReply) {
  const { reason } = req.query as any;

  return reply.type('text/html').send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Failed</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 50px 40px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    }
    .icon {
      width: 80px; height: 80px;
      background: #fff0f3;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 36px;
      animation: pop 0.4s ease;
    }
    @keyframes pop {
      0% { transform: scale(0); }
      70% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    h1 { font-size: 26px; color: #1a1a2e; margin-bottom: 8px; }
    .reason { font-size: 15px; color: #e94560; margin: 16px 0 30px; }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #e94560, #c0392b);
      color: white;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      border: none;
    }
    .logo { font-size: 14px; color: #aaa; margin-top: 24px; }
    .logo span { color: #e94560; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Payment Failed</h1>
    <div class="reason">${decodeURIComponent(reason || 'Something went wrong')}</div>
    <button class="btn" onclick="history.back()">Try Again</button>
    <div class="logo">Powered by <span>PAYFLOW</span></div>
  </div>
</body>
</html>
  `);
}