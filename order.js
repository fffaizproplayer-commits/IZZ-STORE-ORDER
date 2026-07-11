// ======================
// GANTI INI sesuai alamat backend kamu di VPS
// contoh: "https://api.izzstore.com" atau "http://IP_VPS:3000"
// ======================
const API_BASE = "http://node.mypanelkenzyzz.pteroq.xyz:10489";

// ======================
// AMBIL DATA PRODUK DARI URL
// contoh link: order.html?produk=Panel%205GB&harga=5000
// ======================
const params = new URLSearchParams(window.location.search);
const produk = params.get("produk") || "Produk IZZ STORE";
const harga = parseInt(params.get("harga") || "0", 10);

document.getElementById("produk").value = produk;
document.getElementById("hargaDisplay").value = "Rp" + harga.toLocaleString("id-ID");

const isPrivate = produk.includes("Private");
const isSharing = produk.includes("Sharing");
const isAM = isPrivate || isSharing;

const emailField = document.getElementById("emailField");
const emailInput = document.getElementById("email");

if (isPrivate) {
    emailField.classList.remove("hidden");
    emailInput.required = true;
}

// ======================
// PILIH METODE PEMBAYARAN
// ======================
let metode = "tripay";

document.querySelectorAll(".metode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".metode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        metode = btn.dataset.metode;
    });
});

// ======================
// ELEMEN
// ======================
const orderForm = document.getElementById("orderForm");
const orderResult = document.getElementById("orderResult");
const tripayBox = document.getElementById("tripayBox");
const manualBox = document.getElementById("manualBox");
const verifyLinkBox = document.getElementById("verifyLinkBox");
const doneBox = document.getElementById("doneBox");
const statusText = document.getElementById("statusText");

let currentOrderId = null;
let pollInterval = null;

// ======================
// SUBMIT ORDER
// ======================
orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const email = emailInput.value.trim();

    if (!nama || !whatsapp) return;
    if (isPrivate && !email) {
        alert("Email wajib diisi buat AM Premium Private");
        return;
    }

    const submitBtn = orderForm.querySelector(".order-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Memproses...";

    try {
        const res = await fetch(`${API_BASE}/api/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nama, whatsapp, produk, harga, metode, email }),
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Gagal membuat order");
            submitBtn.disabled = false;
            submitBtn.textContent = "Buat Order";
            return;
        }

        currentOrderId = data.order_id;
        document.getElementById("orderIdText").textContent = data.order_id;

        orderForm.classList.add("hidden");
        orderResult.classList.remove("hidden");

        if (metode === "tripay" && data.payment) {
            tripayBox.classList.remove("hidden");
            document.getElementById("qrisImage").src = data.payment.qr_url || "";
            document.getElementById("tripayLink").href = data.payment.checkout_url || "#";
        } else {
            manualBox.classList.remove("hidden");
        }

        setProgress("pending");
        startStatusPolling();
    } catch (err) {
        alert("Gagal menghubungi server. Cek koneksi backend kamu.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Buat Order";
    }
});

// ======================
// PROGRESS BAR
// ======================
function setProgress(status) {
    const steps = document.querySelectorAll(".progress-step");
    const order = ["pending", "lunas", "selesai"];

    let activeIndex = 0;
    if (status === "lunas" || status === "diproses" || status === "menunggu_link") activeIndex = 1;
    if (status === "selesai") activeIndex = 2;

    steps.forEach((el, i) => {
        el.classList.remove("active", "done");
        if (i < activeIndex) el.classList.add("done");
        if (i === activeIndex) el.classList.add("active");
    });
}

// ======================
// POLLING STATUS (semua metode)
// ======================
function startStatusPolling() {
    pollInterval = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/order/${currentOrderId}`);
            const data = await res.json();
            if (!data.success) return;

            const order = data.order;
            setProgress(order.status);

            if (order.status === "pending") {
                statusText.textContent = "Status: menunggu pembayaran...";
            } else if (order.status === "menunggu_verifikasi") {
                statusText.textContent = "Status: bukti transfer diterima, menunggu verifikasi admin...";
            } else if (order.status === "lunas") {
                statusText.textContent = "Status: pembayaran diterima! menyiapkan akun kamu...";
            } else if (order.status === "diproses") {
                statusText.textContent = "Status: sedang memproses akun kamu, mohon tunggu...";
            } else if (order.status === "menunggu_link") {
                statusText.textContent = "Status: link verifikasi sudah dikirim ke email kamu";
                if (isPrivate) verifyLinkBox.classList.remove("hidden");
            } else if (order.status === "selesai") {
                clearInterval(pollInterval);
                statusText.classList.add("hidden");
                tripayBox.classList.add("hidden");
                manualBox.classList.add("hidden");
                verifyLinkBox.classList.add("hidden");
                doneBox.classList.remove("hidden");

                const doneEmail = document.getElementById("doneEmail");
                const doneNote = document.querySelector(".done-note");

                if (isSharing && order.email) {
                    doneEmail.textContent = `Email: ${order.email}`;
                    doneNote.textContent = "Simpan email ini baik-baik ya, dipakai buat login premium kamu.";
                } else if (isAM) {
                    doneEmail.textContent = "Premium udah aktif di email kamu.";
                    doneNote.textContent = "Cek aplikasi Alight Motion buat pastiin statusnya.";
                } else {
                    doneEmail.textContent = "Pesanan kamu sudah diproses admin.";
                    doneNote.textContent = "";
                }
            } else if (order.status === "gagal") {
                clearInterval(pollInterval);
                statusText.textContent = `Status: gagal diproses otomatis (${order.error_message || "error tidak diketahui"}). Hubungi admin ya.`;
                statusText.style.color = "#ff3b57";
            } else if (order.status === "kadaluarsa") {
                clearInterval(pollInterval);
                statusText.textContent = "Status: kadaluarsa, silakan order ulang";
                statusText.style.color = "#ff3b57";
            }
        } catch (err) {
            // diam-diam aja, coba lagi di interval berikutnya
        }
    }, 4000);
}

// ======================
// UPLOAD BUKTI TRANSFER (metode manual)
// ======================
document.getElementById("uploadBuktiBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("buktiFile");
    const uploadStatus = document.getElementById("uploadStatus");

    if (!fileInput.files[0]) {
        uploadStatus.textContent = "Pilih file bukti transfer dulu ya";
        return;
    }

    const formData = new FormData();
    formData.append("bukti", fileInput.files[0]);

    uploadStatus.textContent = "Mengupload...";

    try {
        const res = await fetch(`${API_BASE}/api/order/${currentOrderId}/bukti`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        uploadStatus.textContent = data.success
            ? "Bukti transfer berhasil diupload, tunggu verifikasi admin ya ✅"
            : data.message || "Gagal upload";
    } catch (err) {
        uploadStatus.textContent = "Gagal upload, coba lagi.";
    }
});

// ======================
// SUBMIT LINK VERIFIKASI (khusus AM Premium Private)
// ======================
document.getElementById("submitLinkBtn").addEventListener("click", async () => {
    const linkInput = document.getElementById("verifyLinkInput");
    const verifyLinkStatus = document.getElementById("verifyLinkStatus");
    const link = linkInput.value.trim();

    if (!link) {
        verifyLinkStatus.textContent = "Tempel dulu link verifikasinya ya";
        return;
    }

    verifyLinkStatus.textContent = "Memverifikasi...";

    try {
        const res = await fetch(`${API_BASE}/api/order/${currentOrderId}/verify-link`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ link }),
        });

        const data = await res.json();
        verifyLinkStatus.textContent = data.message || (data.success ? "Berhasil!" : "Gagal");

        if (data.success) {
            // biarin polling berikutnya yang munculin doneBox otomatis
        }
    } catch (err) {
        verifyLinkStatus.textContent = "Gagal menghubungi server, coba lagi.";
    }
});
