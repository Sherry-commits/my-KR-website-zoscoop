const optionLabels = document.querySelectorAll(".option");
const optionInputs = document.querySelectorAll('input[name="bundle"]');
const paypalContainer = document.getElementById("paypal-button-container");
const paypalCardContainer = document.getElementById("paypal-card-button-container");
const paypalStatus = document.getElementById("paypalStatus");
const buyNowBtn = document.getElementById("buyNowBtn");
const addToCartBtn = document.getElementById("addToCartBtn");
const checkoutForm = document.getElementById("checkoutForm");
const orderBundle = document.getElementById("orderBundle");
const orderPrice = document.getElementById("orderPrice");
const productOrderNote = document.getElementById("productOrderNote");
const checkoutOrderNote = document.getElementById("checkoutOrderNote");
const orderNoteSummary = document.getElementById("orderNoteSummary");
const countrySelect = document.getElementById("country");

const COUNTRY_OPTIONS = [
  ["KR", "대한민국"],
  ["AF", "Afghanistan"], ["AL", "Albania"], ["DZ", "Algeria"], ["AD", "Andorra"], ["AO", "Angola"],
  ["AG", "Antigua and Barbuda"], ["AR", "Argentina"], ["AM", "Armenia"], ["AU", "Australia"], ["AT", "Austria"],
  ["AZ", "Azerbaijan"], ["BS", "Bahamas"], ["BH", "Bahrain"], ["BD", "Bangladesh"], ["BB", "Barbados"],
  ["BY", "Belarus"], ["BE", "Belgium"], ["BZ", "Belize"], ["BJ", "Benin"], ["BT", "Bhutan"],
  ["BO", "Bolivia"], ["BA", "Bosnia and Herzegovina"], ["BW", "Botswana"], ["BR", "Brazil"], ["BN", "Brunei"],
  ["BG", "Bulgaria"], ["BF", "Burkina Faso"], ["BI", "Burundi"], ["CV", "Cabo Verde"], ["KH", "Cambodia"],
  ["CM", "Cameroon"], ["CA", "Canada"], ["CF", "Central African Republic"], ["TD", "Chad"], ["CL", "Chile"],
  ["CN", "China"], ["CO", "Colombia"], ["KM", "Comoros"], ["CG", "Congo"], ["CR", "Costa Rica"],
  ["CI", "Cote d'Ivoire"], ["HR", "Croatia"], ["CU", "Cuba"], ["CY", "Cyprus"], ["CZ", "Czech Republic"],
  ["CD", "Democratic Republic of the Congo"], ["DK", "Denmark"], ["DJ", "Djibouti"], ["DM", "Dominica"], ["DO", "Dominican Republic"],
  ["EC", "Ecuador"], ["EG", "Egypt"], ["SV", "El Salvador"], ["GQ", "Equatorial Guinea"], ["ER", "Eritrea"],
  ["EE", "Estonia"], ["SZ", "Eswatini"], ["ET", "Ethiopia"], ["FJ", "Fiji"], ["FI", "Finland"],
  ["FR", "France"], ["GA", "Gabon"], ["GM", "Gambia"], ["GE", "Georgia"], ["DE", "Germany"],
  ["GH", "Ghana"], ["GR", "Greece"], ["GD", "Grenada"], ["GT", "Guatemala"], ["GN", "Guinea"],
  ["GW", "Guinea-Bissau"], ["GY", "Guyana"], ["HT", "Haiti"], ["HN", "Honduras"], ["HU", "Hungary"],
  ["IS", "Iceland"], ["IN", "India"], ["ID", "Indonesia"], ["IR", "Iran"], ["IQ", "Iraq"],
  ["IE", "Ireland"], ["IL", "Israel"], ["IT", "Italy"], ["JM", "Jamaica"], ["JP", "Japan"],
  ["JO", "Jordan"], ["KZ", "Kazakhstan"], ["KE", "Kenya"], ["KI", "Kiribati"], ["KP", "North Korea"],
  ["KW", "Kuwait"], ["KG", "Kyrgyzstan"], ["LA", "Laos"], ["LV", "Latvia"], ["LB", "Lebanon"],
  ["LS", "Lesotho"], ["LR", "Liberia"], ["LY", "Libya"], ["LI", "Liechtenstein"], ["LT", "Lithuania"],
  ["LU", "Luxembourg"], ["MG", "Madagascar"], ["MW", "Malawi"], ["MY", "Malaysia"], ["MV", "Maldives"],
  ["ML", "Mali"], ["MT", "Malta"], ["MH", "Marshall Islands"], ["MR", "Mauritania"], ["MU", "Mauritius"],
  ["MX", "Mexico"], ["FM", "Micronesia"], ["MD", "Moldova"], ["MC", "Monaco"], ["MN", "Mongolia"],
  ["ME", "Montenegro"], ["MA", "Morocco"], ["MZ", "Mozambique"], ["MM", "Myanmar"], ["NA", "Namibia"],
  ["NR", "Nauru"], ["NP", "Nepal"], ["NL", "Netherlands"], ["NZ", "New Zealand"], ["NI", "Nicaragua"],
  ["NE", "Niger"], ["NG", "Nigeria"], ["MK", "North Macedonia"], ["NO", "Norway"], ["OM", "Oman"],
  ["PK", "Pakistan"], ["PW", "Palau"], ["PA", "Panama"], ["PG", "Papua New Guinea"], ["PY", "Paraguay"],
  ["PE", "Peru"], ["PH", "Philippines"], ["PL", "Poland"], ["PT", "Portugal"], ["QA", "Qatar"],
  ["RO", "Romania"], ["RU", "Russia"], ["RW", "Rwanda"], ["KN", "Saint Kitts and Nevis"], ["LC", "Saint Lucia"],
  ["VC", "Saint Vincent and the Grenadines"], ["WS", "Samoa"], ["SM", "San Marino"], ["ST", "Sao Tome and Principe"], ["SA", "Saudi Arabia"],
  ["SN", "Senegal"], ["RS", "Serbia"], ["SC", "Seychelles"], ["SL", "Sierra Leone"], ["SG", "Singapore"],
  ["SK", "Slovakia"], ["SI", "Slovenia"], ["SB", "Solomon Islands"], ["SO", "Somalia"], ["ZA", "South Africa"],
  ["SS", "South Sudan"], ["ES", "Spain"], ["LK", "Sri Lanka"], ["SD", "Sudan"], ["SR", "Suriname"],
  ["SE", "Sweden"], ["CH", "Switzerland"], ["SY", "Syria"], ["TW", "Taiwan"], ["TJ", "Tajikistan"],
  ["TZ", "Tanzania"], ["TH", "Thailand"], ["TL", "Timor-Leste"], ["TG", "Togo"], ["TO", "Tonga"],
  ["TT", "Trinidad and Tobago"], ["TN", "Tunisia"], ["TR", "Turkey"], ["TM", "Turkmenistan"], ["TV", "Tuvalu"],
  ["UG", "Uganda"], ["UA", "Ukraine"], ["AE", "United Arab Emirates"], ["GB", "United Kingdom"], ["US", "United States"],
  ["UY", "Uruguay"], ["UZ", "Uzbekistan"], ["VU", "Vanuatu"], ["VA", "Vatican City"], ["VE", "Venezuela"],
  ["VN", "Vietnam"], ["YE", "Yemen"], ["ZM", "Zambia"], ["ZW", "Zimbabwe"]
];

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

function getProductOrderNote() {
  return productOrderNote?.value?.trim() || "";
}

function setStatus(message) {
  if (paypalStatus) {
    paypalStatus.textContent = message;
  }
}

function hydrateCountryOptions() {
  if (!countrySelect) return;
  countrySelect.innerHTML = "";
  COUNTRY_OPTIONS.forEach(([code, label]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = label;
    if (code === "KR") {
      option.selected = true;
    }
    countrySelect.appendChild(option);
  });
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

    const buttonConfig = {
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
        const capture = await captureOrder(data.orderID);
        const captureId = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id || "";
        const params = new URLSearchParams({
          orderID: data.orderID || "",
          captureID: captureId,
          amount: orderPrice ? orderPrice.textContent.trim() : getSelectedPrice(),
        });
        window.location.href = `./payment-success.html?${params.toString()}`;
      },
      onError: () => {
        window.location.href = "./payment-failed.html?reason=error";
      },
      onCancel: () => {
        window.location.href = "./payment-failed.html?reason=cancel";
      },
    };

    const paypalBtn = window.paypal.Buttons(buttonConfig);
    if (paypalBtn.isEligible()) {
      await paypalBtn.render("#paypal-button-container");
    }

    if (paypalCardContainer && window.paypal.FUNDING?.CARD) {
      const cardBtn = window.paypal.Buttons({
        ...buttonConfig,
        fundingSource: window.paypal.FUNDING.CARD,
        style: {
          ...buttonConfig.style,
          color: "black",
          label: "pay",
        },
      });
      if (cardBtn.isEligible()) {
        await cardBtn.render("#paypal-card-button-container");
      } else {
        paypalCardContainer.style.display = "none";
      }
    }

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
      note: getProductOrderNote(),
    });
    window.location.href = `./checkout.html?${params.toString()}`;
  });
}

if (addToCartBtn) {
  addToCartBtn.addEventListener("click", () => {
    const params = new URLSearchParams({
      bundle: getSelectedBundleName(),
      price: getSelectedPrice(),
      note: getProductOrderNote(),
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
  const note = query.get("note");
  if (bundle) {
    orderBundle.textContent = bundle;
  }
  if (price) {
    orderPrice.textContent = price;
  }
  if (typeof note === "string" && note.trim()) {
    if (checkoutOrderNote) {
      checkoutOrderNote.value = note;
    }
    if (orderNoteSummary) {
      orderNoteSummary.textContent = note;
    }
  } else if (orderNoteSummary) {
    orderNoteSummary.textContent = "없음";
  }
}

if (checkoutOrderNote && orderNoteSummary) {
  checkoutOrderNote.addEventListener("input", () => {
    const noteValue = checkoutOrderNote.value.trim();
    orderNoteSummary.textContent = noteValue || "없음";
  });
}

hydrateCheckoutSummaryFromQuery();
hydrateCountryOptions();
initPaypalButtons();
