import { useState, useMemo } from "react";

const LOAN = {
  principal: 634871.32,
  rate: 3.9,
  basePayment: 2900,
};

const EXTRAS = [0, 500, 1000, 1500, 2000];

function amortize(principal, annualRate, monthlyPayment) {
  const mr = annualRate / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600;

  while (balance > 0.01 && months < maxMonths) {
    const interest = balance * mr;
    let principalPaid = monthlyPayment - interest;
    if (principalPaid <= 0) return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity };
    if (principalPaid > balance) {
      totalInterest += interest;
      months++;
      break;
    }
    balance -= principalPaid;
    totalInterest += interest;
    months++;
  }

  return {
    months,
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalInterest + principal),
  };
}

function formatNum(n) {
  if (n === Infinity) return "∞";
  return n.toLocaleString("th-TH");
}

function formatYearsMonths(m) {
  if (m === Infinity) return "ไม่สิ้นสุด";
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} เดือน`;
  if (mo === 0) return `${y} ปี`;
  return `${y} ปี ${mo} เดือน`;
}

export default function LoanCalculator() {
  const [selected, setSelected] = useState(null);

  const results = useMemo(() => {
    return EXTRAS.map((extra) => {
      const payment = LOAN.basePayment + extra;
      const res = amortize(LOAN.principal, LOAN.rate, payment);
      return { extra, payment, ...res };
    });
  }, []);

  const base = results[0];

  const maxInterest = base.totalInterest;
  const maxMonths = base.months;

  const activeIdx = selected !== null ? selected : 0;
  const active = results[activeIdx];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e17 0%, #141c2e 50%, #1a1025 100%)",
      fontFamily: "'Noto Sans Thai', 'Sarabun', sans-serif",
      color: "#e8e4ef",
      padding: "24px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #f59e0b22, #f59e0b08)",
          border: "1px solid #f59e0b44",
          borderRadius: 8,
          padding: "4px 14px",
          fontSize: 11,
          color: "#f59e0b",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: 10,
        }}>ธอส. สินเชื่อบ้าน</div>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          margin: "0 0 6px",
          background: "linear-gradient(90deg, #c4b5fd, #818cf8, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>คำนวณการจ่ายเพิ่ม</h1>
        <p style={{ color: "#8b8698", fontSize: 13, margin: 0 }}>
          เงินต้นคงเหลือ {formatNum(LOAN.principal)} บาท · ดอกเบี้ย {LOAN.rate}% ต่อปี
        </p>
      </div>

      {/* Payment Selector Buttons */}
      <div style={{
        display: "flex",
        gap: 6,
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: 24,
      }}>
        {EXTRAS.map((extra, i) => {
          const isActive = activeIdx === i;
          return (
            <button
              key={extra}
              onClick={() => setSelected(i)}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                border: isActive ? "1.5px solid #818cf8" : "1.5px solid #2a2540",
                background: isActive
                  ? "linear-gradient(135deg, #818cf822, #6366f122)"
                  : "rgba(255,255,255,0.03)",
                color: isActive ? "#c4b5fd" : "#6b6580",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {extra === 0 ? "ปกติ ฿2,900" : `+฿${formatNum(extra)}`}
            </button>
          );
        })}
      </div>

      {/* Active Result Card */}
      <div style={{
        background: "linear-gradient(145deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#8b8698", marginBottom: 2 }}>จ่ายต่อเดือน</div>
            <div style={{
              fontSize: 26,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#e8e4ef",
            }}>
              ฿{formatNum(active.payment)}
            </div>
          </div>
          {activeIdx > 0 && (
            <div style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              borderRadius: 10,
              padding: "8px 14px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 10, opacity: 0.8 }}>ประหยัดดอกเบี้ย</div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                ฿{formatNum(base.totalInterest - active.totalInterest)}
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        }}>
          <StatBox
            label="ระยะเวลาผ่อน"
            value={formatYearsMonths(active.months)}
            sub={activeIdx > 0 ? `ลด ${formatYearsMonths(base.months - active.months)}` : "เงื่อนไขเดิม"}
            subColor={activeIdx > 0 ? "#34d399" : "#6b6580"}
          />
          <StatBox
            label="ดอกเบี้ยทั้งหมด"
            value={`฿${formatNum(active.totalInterest)}`}
            sub={activeIdx > 0 ? `ลด ${((1 - active.totalInterest / base.totalInterest) * 100).toFixed(1)}%` : "100%"}
            subColor={activeIdx > 0 ? "#34d399" : "#6b6580"}
          />
          <StatBox
            label="จ่ายรวมทั้งหมด"
            value={`฿${formatNum(active.totalPaid)}`}
            sub={activeIdx > 0 ? `ลด ฿${formatNum(base.totalPaid - active.totalPaid)}` : "฿" + formatNum(base.totalPaid)}
            subColor={activeIdx > 0 ? "#34d399" : "#6b6580"}
          />
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 18,
        marginBottom: 20,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: "#a5a0b2" }}>
          เปรียบเทียบดอกเบี้ยรวม
        </h3>
        {results.map((r, i) => {
          const pct = (r.totalInterest / maxInterest) * 100;
          const isActive = activeIdx === i;
          const saved = base.totalInterest - r.totalInterest;
          return (
            <div
              key={i}
              onClick={() => setSelected(i)}
              style={{
                marginBottom: i < results.length - 1 ? 12 : 0,
                cursor: "pointer",
                opacity: isActive ? 1 : 0.6,
                transition: "opacity 0.2s",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
                color: isActive ? "#e8e4ef" : "#6b6580",
                fontWeight: isActive ? 600 : 400,
              }}>
                <span>{r.extra === 0 ? "ปกติ ฿2,900/เดือน" : `+฿${formatNum(r.extra)} (฿${formatNum(r.payment)}/เดือน)`}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: i > 0 ? "#34d399" : "#8b8698",
                }}>
                  {i > 0 ? `ประหยัด ฿${formatNum(saved)}` : `฿${formatNum(r.totalInterest)}`}
                </span>
              </div>
              <div style={{
                height: 8,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 4,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: i === 0
                    ? "linear-gradient(90deg, #ef4444, #f97316)"
                    : `linear-gradient(90deg, ${["#f59e0b","#22c55e","#10b981","#06b6d4"][i-1]}, ${["#eab308","#16a34a","#059669","#0891b2"][i-1]})`,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Comparison */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 18,
        marginBottom: 20,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: "#a5a0b2" }}>
          เปรียบเทียบระยะเวลาผ่อน
        </h3>
        {results.map((r, i) => {
          const pct = (r.months / maxMonths) * 100;
          const isActive = activeIdx === i;
          return (
            <div
              key={i}
              onClick={() => setSelected(i)}
              style={{
                marginBottom: i < results.length - 1 ? 12 : 0,
                cursor: "pointer",
                opacity: isActive ? 1 : 0.6,
                transition: "opacity 0.2s",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 4,
                color: isActive ? "#e8e4ef" : "#6b6580",
                fontWeight: isActive ? 600 : 400,
              }}>
                <span>฿{formatNum(r.payment)}/เดือน</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                }}>
                  {formatYearsMonths(r.months)}
                </span>
              </div>
              <div style={{
                height: 8,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 4,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: i === 0
                    ? "linear-gradient(90deg, #ef4444, #f97316)"
                    : `linear-gradient(90deg, ${["#f59e0b","#22c55e","#10b981","#06b6d4"][i-1]}, ${["#eab308","#16a34a","#059669","#0891b2"][i-1]})`,
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 18,
        overflow: "auto",
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: "#a5a0b2" }}>
          ตารางสรุป
        </h3>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
        }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["จ่าย/เดือน", "ระยะเวลา", "ดอกเบี้ยรวม", "ประหยัด"].map((h) => (
                <th key={h} style={{
                  padding: "8px 6px",
                  textAlign: "right",
                  color: "#6b6580",
                  fontWeight: 500,
                  fontSize: 11,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const saved = base.totalInterest - r.totalInterest;
              const isActive = activeIdx === i;
              return (
                <tr
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                  }}
                >
                  <td style={{
                    padding: "10px 6px",
                    textAlign: "right",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#c4b5fd" : "#e8e4ef",
                  }}>
                    ฿{formatNum(r.payment)}
                  </td>
                  <td style={{
                    padding: "10px 6px",
                    textAlign: "right",
                    color: isActive ? "#e8e4ef" : "#8b8698",
                  }}>
                    {formatYearsMonths(r.months)}
                  </td>
                  <td style={{
                    padding: "10px 6px",
                    textAlign: "right",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isActive ? "#e8e4ef" : "#8b8698",
                    fontSize: 11,
                  }}>
                    ฿{formatNum(r.totalInterest)}
                  </td>
                  <td style={{
                    padding: "10px 6px",
                    textAlign: "right",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: i === 0 ? "#6b6580" : "#34d399",
                    fontSize: 11,
                  }}>
                    {i === 0 ? "—" : `฿${formatNum(saved)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{
        textAlign: "center",
        color: "#4a4560",
        fontSize: 10,
        marginTop: 16,
        lineHeight: 1.6,
      }}>
        * คำนวณแบบอัตราดอกเบี้ยคงที่ 3.9% ตลอดอายุสัญญา (จริงอาจมีการเปลี่ยนแปลง)
        <br />* ไม่รวมค่าประกันอัคคีภัย ค่าธรรมเนียม หรือค่าใช้จ่ายอื่นๆ
      </p>
    </div>
  );
}

function StatBox({ label, value, sub, subColor }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.2)",
      borderRadius: 10,
      padding: "10px 8px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 10, color: "#6b6580", marginBottom: 4 }}>{label}</div>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#e8e4ef",
        marginBottom: 2,
        fontFamily: value.includes("฿") ? "'JetBrains Mono', monospace" : "inherit",
        lineHeight: 1.3,
      }}>{value}</div>
      <div style={{ fontSize: 10, color: subColor, fontWeight: 500 }}>{sub}</div>
    </div>
  );
}
