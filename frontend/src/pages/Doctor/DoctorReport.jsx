import DoctorLayout from "../../layouts/DoctorLayout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/doctorApi";
import html2pdf from "html2pdf.js";

export default function DoctorReport() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const fromScan = searchParams.get("from") === "scan";

  const [report, setReport] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState([]);
  const [doctorRecs, setDoctorRecs] = useState([]);
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  /* ======================
     تحميل PDF
  ====================== */
  const downloadPDF = () => {
    const element = document.getElementById("report-content");
    if (!element) return;

    html2pdf()
      .set({
        margin: 10,
        filename: "basira-medical-report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  /* ======================
     جلب التقرير
  ====================== */
  const fetchReport = async () => {
    try {
      const res = await api.get(`/doctor/tests/${testId}/report`);
      const data = res.data;

      setReport(data);
      setStatus(data?.status || "draft");

      const notes = data?.notes || [];
      setDoctorNotes(notes.filter((n) => n.type === "note"));
      setDoctorRecs(notes.filter((n) => n.type === "recommendation"));
    } catch (err) {
      console.error("فشل تحميل التقرير", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [testId]);

  /* ======================
     تشغيل الذكاء الاصطناعي
  ====================== */
  const runAI = async () => {
    try {
      setAiLoading(true);
      await api.post(`/doctor/tests/${testId}/run-ai`);
      await fetchReport();
      alert("تم تشغيل تحليل الذكاء الاصطناعي بنجاح");
    } catch (err) {
      console.error(err);
      alert("فشل تشغيل تحليل الذكاء الاصطناعي");
    } finally {
      setAiLoading(false);
    }
  };

  /* ======================
     اعتماد التقرير
  ====================== */
  const approveReport = async () => {
    try {
      await api.patch(`/doctor/tests/${testId}/approve`);
      alert("تم اعتماد التقرير الطبي رسميًا");
      navigate("/doctor-reports");
    } catch (err) {
      alert("فشل اعتماد التقرير");
    }
  };


  /* ======================
     📝 حفظ كمسودة
  ====================== */
  /* ======================
   📝 حفظ التقرير كمسودة
====================== */
const saveAsDraft = async () => {
  try {
    await api.patch(`/doctor/tests/${testId}`, {
  status: "draft",
});
    alert("تم حفظ التقرير كمسودة");
    navigate("/doctor-reports");
  } catch (err) {
    console.error(err);
    alert("فشل حفظ التقرير كمسودة");
  }
};


  if (loading) {
    return (
      <DoctorLayout>
        <p className="text-center mt-20 text-gray-500">
          جاري تحميل التقرير الطبي...
        </p>
      </DoctorLayout>
    );
  }

  if (!report) {
    return (
      <DoctorLayout>
        <p className="text-center mt-20 text-red-500">
          تعذر تحميل التقرير الطبي
        </p>
      </DoctorLayout>
    );
  }

  /* ======================
     منطق الذكاء الاصطناعي
  ====================== */
  const ai = report.aiResult;

  const hasValidAI =
    ai &&
    typeof ai.confidence === "number" &&
    ai.label !== "Inconclusive";

  const asdPercentage = hasValidAI
    ? Math.round(ai.confidence * 100)
    : null;

  let displayLabel = ai?.label;
  if (hasValidAI && asdPercentage >= 90) {
    displayLabel = "اشتباه توحد (High Risk)";
  }

  return (
    <DoctorLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div
          id="report-content"
          className="bg-white rounded-xl border p-8 space-y-8"
        >
          {/* ===== الهيدر ===== */}
          <div className="border-b pb-4 text-center">
            <img
              src="/basira-logo.svg"
              alt="Basira Logo"
              className="h-12 mx-auto"
            />
            <p className="text-sm font-semibold text-[#0A2A43]">
              منصة بصيرة الطبية
            </p>
            <p className="text-xs text-gray-500">
              Basira Medical Platform
            </p>
          </div>

          <h1 className="text-2xl font-bold text-center text-[#0A2A43]">
            التقرير الطبي – فحص تتبع العين
          </h1>

          {/* ===== بيانات المريض ===== */}
          {report.patient && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>اسم المريض:</strong> {report.patient.name}</p>
              <p><strong>العمر:</strong> {report.patient.age || "—"}</p>
              <p><strong>رقم الملف:</strong> {report.patient.file_number}</p>
              <p><strong>نوع الفحص:</strong> تتبع العين</p>
              <p><strong>الطبيب المشرف:</strong> {report.doctor?.name}</p>
              <p>
                <strong>تاريخ التقرير:</strong>{" "}
                {new Date(report.createdAt).toLocaleDateString("ar-SA")}
              </p>
            </div>
          )}

          <hr />

          {/* ===== نتيجة الذكاء الاصطناعي ===== */}
          <div className="bg-[#F8FAFC] border rounded-xl p-6 text-center space-y-4">
            <h2 className="font-bold text-lg text-[#0A2A43]">
              نتيجة تحليل الذكاء الاصطناعي (ASD)
            </h2>

            {hasValidAI ? (
              <>
                <p className="text-5xl font-extrabold text-[#135C8A]">
                  {asdPercentage}%
                </p>

                <p className="text-sm font-semibold">
                  تصنيف النموذج:{" "}
                  <span
                    className={
                      asdPercentage >= 90
                        ? "text-orange-600"
                        : ai.label === "ASD"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {displayLabel}
                  </span>
                </p>

                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
                  ⚠️ هذا التحليل ناتج عن نموذج ذكاء اصطناعي ويُعد أداة مساعدة فقط،
                  ولا يُعتبر تشخيصًا طبيًا نهائيًا.
                </div>

                {ai.gazeStats && (
                  <div className="text-right mt-4">
                    <h3 className="font-semibold mb-2 text-[#0A2A43]">
                      تحليل توزيع نظرات العين
                    </h3>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-white border rounded-lg p-3">
                        <p className="font-semibold">وسط</p>
                        <p>{Math.round(ai.gazeStats.center * 100)}%</p>
                        <p className="text-xs text-gray-400">
                          الطبيعي: 40% – 60%
                        </p>
                      </div>

                      <div className="bg-white border rounded-lg p-3">
                        <p className="font-semibold">يسار</p>
                        <p>{Math.round(ai.gazeStats.left * 100)}%</p>
                        <p className="text-xs text-gray-400">
                          الطبيعي: 20% – 30%
                        </p>
                      </div>

                      <div className="bg-white border rounded-lg p-3">
                        <p className="font-semibold">يمين</p>
                        <p>{Math.round(ai.gazeStats.right * 100)}%</p>
                        <p className="text-xs text-gray-400">
                          الطبيعي: 20% – 30%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">
                لم يتمكن نموذج الذكاء الاصطناعي من استخراج مؤشرات كافية
                من بيانات تتبع العين.
              </p>
            )}
          </div>

          <hr />

          {/* ===== ملاحظات الطبيب ===== */}
          <div>
            <h2 className="font-bold mb-2">ملاحظات الطبيب</h2>
            {doctorNotes.length ? (
              <ul className="list-disc pr-5 space-y-1">
                {doctorNotes.map((n, i) => (
                  <li key={i}>{n.text}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">لا توجد ملاحظات.</p>
            )}
          </div>

          <hr />

          {/* ===== التوصيات ===== */}
          <div>
            <h2 className="font-bold mb-2">التوصيات الطبية</h2>
            {doctorRecs.length ? (
              <ul className="list-disc pr-5 space-y-1">
                {doctorRecs.map((r, i) => (
                  <li key={i}>{r.text}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">لا توجد توصيات.</p>
            )}
          </div>
        </div>

        {/* ===== الأزرار ===== */}
<div className="flex gap-4 items-center">

  <button
    onClick={downloadPDF}
    className="bg-[#135C8A] text-white px-6 py-2 rounded-lg font-semibold"
  >
    تحميل PDF
  </button>

  {/* تشغيل الذكاء فقط من صفحة الفحص */}
  {fromScan && status !== "approved" && (
    <button
      onClick={runAI}
      disabled={aiLoading}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
    >
      {aiLoading ? "جاري التحليل..." : "تشغيل تحليل الذكاء"}
    </button>
  )}

  {/* حفظ مسودة لأي تقرير غير معتمد */}
  {status !== "approved" && (
    <button
      onClick={saveAsDraft}
      className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold border"
    >
      حفظ كمسودة
    </button>
  )}

  {/* اعتماد التقرير لأي تقرير غير معتمد */}
{status !== "approved" && (
  <button
    onClick={approveReport}
    className="bg-[#135C8A] text-white px-6 py-2 rounded-lg font-semibold"
  >
    اعتماد التقرير
  </button>
)}


</div>

      </div>
    </DoctorLayout>
  );
}
