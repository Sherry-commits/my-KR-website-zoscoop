const optionLabels = document.querySelectorAll(".option");
const optionInputs = document.querySelectorAll('input[name="bundle"]');
const paypalContainer = document.getElementById("paypal-button-container");
const paypalStatus = document.getElementById("paypalStatus");
const buyNowBtn = document.getElementById("buyNowBtn");
const addToCartBtn = document.getElementById("addToCartBtn");
const checkoutForm = document.getElementById("checkoutForm");
const orderBundle = document.getElementById("orderBundle");
const orderPrice = document.getElementById("orderPrice");

function syncActiveOption() {
  optionLabels.forEach((label) => label.classList.remove("active"));
  optionInputs.forEach((input) => {
    if (input.checked) {
      input.closest(".option")?.classList.add("active");
    }
  });
}

optionInputs.forEach((input) => {
  input.addEventListener("change", syncActiveOption);
});

syncActiveOption();

function getSelectedPrice() {
  const selected = document.querySelector('input[name="bundle"]:checked');
  return selected?.dataset.price || "35.99";
}

function getSelectedBundleName() {
  const selected = document.querySelector('input[name="bundle"]:checked');
  return selected?.closest(".option")?.querySelector(".option-main")?.textContent?.trim() || "1 스쿱 + 무료 선물 2개";
}

function setStatus(message) {
  if (paypalStatus) {
    paypalStatus.textContent = message;
  }
}

function loadPaypalSdk(clientId) {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PayPal SDK 로드 실패"));
    document.head.appendChild(script);
  });
}

async function createOrder(price) {
  const response = await fetch("/api/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: price }),
  });

  if (!response.ok) {
    throw new Error("주문 생성 실패");
  }

  const data = await response.json();
  return data.id;
}

async function captureOrder(orderId) {
  const response = await fetch("/api/paypal/capture-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderID: orderId }),
  });

  if (!response.ok) {
    throw new Error("결제 승인 실패");
  }

  return response.json();
}

async function initPaypalButtons() {
  if (!paypalContainer) {
    return;
  }

  try {
    setStatus("PayPal 결제 버튼을 불러오는 중...");
    const configResponse = await fetch("/api/paypal/config");
    if (!configResponse.ok) {
      throw new Error("PayPal 설정 로드 실패");
    }
    const config = await configResponse.json();
    await loadPaypalSdk(config.clientId);

    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      },
      createOrder: async () => {
        if (checkoutForm && !checkoutForm.reportValidity()) {
          throw new Error("입력 정보가 필요합니다.");
        }
        const price = orderPrice ? orderPrice.textContent.trim() : getSelectedPrice();
        return createOrder(price);
      },
      onApprove: async (data) => {
        await captureOrder(data.orderID);
        setStatus("결제가 완료되었습니다. 감사합니다!");
      },
      onError: () => {
        setStatus("결제 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      },
    }).render("#paypal-button-container");

    setStatus("선택한 옵션으로 PayPal 결제가 가능합니다.");
  } catch (error) {
    setStatus("PayPal 설정이 아직 완료되지 않았습니다. 관리자 설정 후 이용해 주세요.");
  }
}

if (buyNowBtn) {
  buyNowBtn.addEventListener("click", () => {
    const params = new URLSearchParams({
      bundle: getSelectedBundleName(),
      price: getSelectedPrice(),
    });
    window.location.href = `./checkout.html?${params.toString()}`;
  });
}

if (addToCartBtn) {
  addToCartBtn.addEventListener("click", () => {
    const params = new URLSearchParams({
      bundle: getSelectedBundleName(),
      price: getSelectedPrice(),
    });
    window.location.href = `./checkout.html?${params.toString()}`;
  });
}

function hydrateCheckoutSummaryFromQuery() {
  if (!orderBundle || !orderPrice) {
    return;
  }
  const query = new URLSearchParams(window.location.search);
  const bundle = query.get("bundle");
  const price = query.get("price");
  if (bundle) {
    orderBundle.textContent = bundle;
  }
  if (price) {
    orderPrice.textContent = price;
  }
}

hydrateCheckoutSummaryFromQuery();
initPaypalButtons();
