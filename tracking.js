const trackingLookupForm = document.getElementById("trackingLookupForm");
const trackingLookupResult = document.getElementById("trackingLookupResult");
const trackingAdminForm = document.getElementById("trackingAdminForm");
const trackingAdminResult = document.getElementById("trackingAdminResult");

function renderResult(container, html, isError = false) {
  if (!container) return;
  container.hidden = false;
  container.classList.toggle("error", isError);
  container.innerHTML = html;
}

if (trackingLookupForm) {
  trackingLookupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const orderId = document.getElementById("lookupOrderId").value.trim();
    if (!orderId) return;

    try {
      const response = await fetch(`/api/tracking/${encodeURIComponent(orderId)}`);
      if (!response.ok) {
        throw new Error("해당 주문의 배송 정보를 찾을 수 없습니다.");
      }
      const data = await response.json();
      renderResult(
        trackingLookupResult,
        `<h3>배송 정보</h3>
         <p><strong>주문 번호:</strong> ${data.orderId}</p>
         <p><strong>택배사:</strong> ${data.carrier || "-"}</p>
         <p><strong>운송장 번호:</strong> ${data.trackingNumber || "-"}</p>
         <p><strong>배송 상태:</strong> ${data.status || "-"}</p>
         <p><strong>최종 업데이트:</strong> ${new Date(data.updatedAt).toLocaleString("ko-KR")}</p>
         <p><strong>메모:</strong> ${data.note || "-"}</p>`
      );
    } catch (error) {
      renderResult(trackingLookupResult, `<p>${error.message}</p>`, true);
    }
  });
}

if (trackingAdminForm) {
  trackingAdminForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      orderId: document.getElementById("adminOrderId").value.trim(),
      carrier: document.getElementById("adminCarrier").value.trim(),
      trackingNumber: document.getElementById("adminTrackingNumber").value.trim(),
      status: document.getElementById("adminStatus").value.trim(),
      note: document.getElementById("adminNote").value.trim(),
    };
    const adminKey = document.getElementById("adminKey").value.trim();

    try {
      const response = await fetch("/api/tracking/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("저장 실패: 관리자 키 또는 입력값을 확인해 주세요.");
      }

      const data = await response.json();
      renderResult(
        trackingAdminResult,
        `<h3>저장 완료</h3>
         <p><strong>주문 번호:</strong> ${data.record.orderId}</p>
         <p><strong>택배사:</strong> ${data.record.carrier || "-"}</p>
         <p><strong>운송장 번호:</strong> ${data.record.trackingNumber || "-"}</p>
         <p><strong>배송 상태:</strong> ${data.record.status || "-"}</p>`
      );
    } catch (error) {
      renderResult(trackingAdminResult, `<p>${error.message}</p>`, true);
    }
  });
}
