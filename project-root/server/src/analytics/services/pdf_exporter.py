# server/src/analytics/services/pdf_exporter.py
"""
PDF export for analytics dashboard.
Generates styled PDFs for both File Analytics and Security tabs.
"""

from io import BytesIO
from datetime import datetime
from typing import Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER


# ── Brand colors ─────────────────────────────────────────────────────────────
BRAND_BLUE   = colors.HexColor("#3B82F6")
BRAND_INDIGO = colors.HexColor("#6366F1")
TEXT_DARK    = colors.HexColor("#0F172A")
TEXT_MUTED   = colors.HexColor("#64748B")
BORDER_LIGHT = colors.HexColor("#E2E8F0")
BG_SOFT      = colors.HexColor("#F8FAFC")
GREEN        = colors.HexColor("#16A34A")
RED          = colors.HexColor("#DC2626")
ORANGE       = colors.HexColor("#F59E0B")


def _get_styles():
    """Custom paragraph styles."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="TrustHeader",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=TEXT_DARK,
        spaceAfter=6,
        leading=28,
    ))

    styles.add(ParagraphStyle(
        name="TrustSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=TEXT_MUTED,
        spaceAfter=20,
    ))

    styles.add(ParagraphStyle(
        name="TrustSection",
        parent=styles["Heading2"],
        fontSize=15,
        textColor=TEXT_DARK,
        spaceAfter=10,
        spaceBefore=16,
    ))

    styles.add(ParagraphStyle(
        name="TrustMeta",
        parent=styles["Normal"],
        fontSize=9,
        textColor=TEXT_MUTED,
        alignment=TA_CENTER,
    ))

    styles.add(ParagraphStyle(
        name="TrustLabel",
        parent=styles["Normal"],
        fontSize=9,
        textColor=TEXT_MUTED,
    ))

    styles.add(ParagraphStyle(
        name="TrustValue",
        parent=styles["Normal"],
        fontSize=20,
        textColor=TEXT_DARK,
        fontName="Helvetica-Bold",
    ))

    return styles


def _kpi_grid(kpis: list, styles) -> Table:
    """Render KPI cards as a grid table."""
    # Each cell is a mini table with value + label
    cells = []
    for kpi in kpis:
        inner = Table(
            [
                [Paragraph(f'<font size="20"><b>{kpi["value"]}</b></font>', styles["Normal"])],
                [Paragraph(f'<font size="9" color="#64748B">{kpi["label"]}</font>', styles["Normal"])],
                [Paragraph(f'<font size="8" color="#94A3B8">{kpi.get("sub", "")}</font>', styles["Normal"])],
            ],
            colWidths=[3.8 * cm],
        )
        inner.setStyle(TableStyle([
            ("VALIGN",       (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",  (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING",   (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 12),
            ("BACKGROUND",   (0, 0), (-1, -1), colors.white),
            ("BOX",          (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
            ("ROUNDEDCORNERS", [6, 6, 6, 6]),
        ]))
        cells.append(inner)

    # Wrap in outer table (row of cards)
    outer = Table([cells], colWidths=[4 * cm] * len(cells))
    outer.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",  (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return outer


def _section_table(headers: list, rows: list, col_widths=None) -> Table:
    """Generic styled table with header + rows."""
    data = [headers] + rows

    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        # Header
        ("BACKGROUND",    (0, 0), (-1, 0), BG_SOFT),
        ("TEXTCOLOR",     (0, 0), (-1, 0), TEXT_DARK),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 9),
        ("TOPPADDING",    (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        # Body
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 1), (-1, -1), TEXT_DARK),
        ("TOPPADDING",    (0, 1), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        # Grid
        ("LINEBELOW",     (0, 0), (-1, 0), 1, BORDER_LIGHT),
        ("LINEBELOW",     (0, 1), (-1, -1), 0.3, BORDER_LIGHT),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return table


def _footer(canvas, doc):
    """Page footer with page number + generated timestamp."""
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(TEXT_MUTED)
    footer_text = (
        f"TrustShare Analytics · Generated {datetime.now().strftime('%b %d, %Y %I:%M %p')} · "
        f"Page {doc.page}"
    )
    canvas.drawCentredString(A4[0] / 2, 1.2 * cm, footer_text)
    canvas.restoreState()


def _build_header(styles, title: str, subtitle: str, date_range_label: str):
    """Report header block."""
    elements = []
    elements.append(Paragraph(title, styles["TrustHeader"]))
    elements.append(Paragraph(
        f'{subtitle} · <font color="#3B82F6"><b>{date_range_label}</b></font>',
        styles["TrustSubtitle"]
    ))
    return elements


# ═══════════════════════════════════════════════════════════════════════════
# FILE ANALYTICS PDF
# ═══════════════════════════════════════════════════════════════════════════

def generate_file_analytics_pdf(
    data: Dict[str, Any],
    date_range_label: str = "Last 30 days",
) -> bytes:
    """Generates PDF for the File Analytics tab."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="TrustShare — File Analytics Report",
    )
    styles = _get_styles()
    elements = []

    # ── Header ────────────────────────────────────────────────────────────
    elements.extend(_build_header(
        styles,
        "File Analytics Report",
        "Workspace file activity and storage insights",
        date_range_label,
    ))

    # ── KPI cards ─────────────────────────────────────────────────────────
    storage    = data.get("storage",    {})
    uploads    = data.get("uploads",    {})
    downloads  = data.get("downloads",  {})
    sharing    = data.get("sharing",    {})
    deletes    = data.get("deletes",    {})

    kpis = [
        {
            "value": f"{storage.get('storage_used_gb', 0):.2f} GB",
            "label": "Storage Used",
            "sub":   f"of {storage.get('storage_quota_gb', 0)} GB",
        },
        {
            "value": f"{uploads.get('total_uploads', 0):,}",
            "label": "Files Uploaded",
            "sub":   f"{uploads.get('today_uploads', 0)} today",
        },
        {
            "value": f"{downloads.get('total_downloads', 0):,}",
            "label": "Downloads",
            "sub":   f"{downloads.get('transferred_mb', 0):.1f} MB transferred",
        },
        {
            "value": f"{sharing.get('active_links', 0):,}",
            "label": "Active Shares",
            "sub":   f"+{sharing.get('new_this_week', 0)} this week",
        },
        {
            "value": f"{deletes.get('total_deletes', 0):,}",
            "label": "Files Deleted",
            "sub":   f"{deletes.get('this_week_deletes', 0)} this week",
        },
    ]

    elements.append(_kpi_grid(kpis, styles))
    elements.append(Spacer(1, 0.5 * cm))

    # ── Storage trend ─────────────────────────────────────────────────────
    trend = storage.get("trend", [])
    if trend:
        elements.append(Paragraph("Storage Usage Over Time", styles["TrustSection"]))
        rows = [[t.get("month", ""), f"{t.get('gb', 0):.4f} GB"] for t in trend]
        elements.append(_section_table(
            ["Month", "Storage"],
            rows,
            col_widths=[8 * cm, 4 * cm],
        ))

    # ── Volume weekly ─────────────────────────────────────────────────────
    volume = uploads.get("volume_weekly", [])
    if volume:
        elements.append(Paragraph("Upload / Download Volume", styles["TrustSection"]))
        rows = [
            [v.get("week", ""), str(v.get("uploads", 0)), str(v.get("downloads", 0))]
            for v in volume
        ]
        elements.append(_section_table(
            ["Week Starting", "Uploads", "Downloads"],
            rows,
            col_widths=[6 * cm, 4 * cm, 4 * cm],
        ))

    # ── Top shared files ──────────────────────────────────────────────────
    top_files = sharing.get("top_files", [])
    if top_files:
        elements.append(Paragraph("Top Shared Files", styles["TrustSection"]))
        rows = [
            [
                str(f.get("rank", "")),
                f.get("name", "")[:50],  # truncate long names
                str(f.get("opens", 0)),
                str(f.get("downloads", 0)),
            ]
            for f in top_files
        ]
        elements.append(_section_table(
            ["#", "File Name", "Opens", "Downloads"],
            rows,
            col_widths=[1 * cm, 9 * cm, 2.5 * cm, 2.5 * cm],
        ))

    # ── Sharing by department ─────────────────────────────────────────────
    departments = sharing.get("by_department", [])
    if departments:
        elements.append(Paragraph("Sharing by Department", styles["TrustSection"]))
        rows = [
            [d.get("name", ""), f"{d.get('value', 0)}%"]
            for d in departments
        ]
        elements.append(_section_table(
            ["Department", "Share of Activity"],
            rows,
            col_widths=[8 * cm, 4 * cm],
        ))

        # ── Recent Activity ───────────────────────────────────────────────────
    recent_activity = data.get("recent_activity", {}) or {}
    activities = recent_activity.get("activities", []) or []
    
    if activities:
        elements.append(Paragraph("Recent Activity", styles["TrustSection"]))
        rows = []
        for activity in activities[:20]:  # Show last 20 activities
            # Handle both dict and object types
            if isinstance(activity, dict):
                event = activity.get("event_type", "") or activity.get("action", "")
                user = activity.get("user", "")
                file = activity.get("file", "")
                time = str(activity.get("time", "") or activity.get("date", ""))
            else:
                event = getattr(activity, "event_type", "") or getattr(activity, "action", "")
                user = getattr(activity, "user", "")
                file = getattr(activity, "file", "")
                time = str(getattr(activity, "time", "") or getattr(activity, "date", ""))
            
            rows.append([
                str(event)[:20],
                str(user)[:20],
                str(file)[:35],
                str(time)[:20],
            ])
        
        elements.append(_section_table(
            ["Event", "User", "File", "Time"],
            rows,
            col_widths=[3.5 * cm, 3.5 * cm, 6 * cm, 4 * cm],
        ))

    # Build PDF
    doc.build(elements, onFirstPage=_footer, onLaterPages=_footer)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


# ═══════════════════════════════════════════════════════════════════════════
# SECURITY PDF
# ═══════════════════════════════════════════════════════════════════════════

def generate_security_pdf(
    data: Dict[str, Any],
    date_range_label: str = "Last 30 days",
) -> bytes:
    """Generates PDF for the Security tab."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="TrustShare — Security Report",
    )
    styles = _get_styles()
    elements = []

    # ── Header ────────────────────────────────────────────────────────────
    elements.extend(_build_header(
        styles,
        "Security Report",
        "Login activity, threats, and access monitoring",
        date_range_label,
    ))

    security = data.get("security", {})

    # ── KPI cards ─────────────────────────────────────────────────────────
    kpis = [
        {
            "value": f"{security.get('login_events', 0):,}",
            "label": "Successful Logins",
            "sub":   "All time",
        },
        {
            "value": f"{security.get('failed_logins', 0):,}",
            "label": "Failed Attempts",
            "sub":   "All time",
        },
        {
            "value": f"{security.get('blocked_attacks', 0):,}",
            "label": "Blocked Attacks",
            "sub":   "All time",
        },
        {
            "value": f"{security.get('security_events', 0):,}",
            "label": "Security Events",
            "sub":   "All time",
        },
    ]

    elements.append(_kpi_grid(kpis, styles))
    elements.append(Spacer(1, 0.5 * cm))

    # ── Login activity ────────────────────────────────────────────────────
    login_activity = security.get("login_activity", [])
    if login_activity:
        elements.append(Paragraph("Login Activity", styles["TrustSection"]))
        rows = [
            [l.get("date", ""), str(l.get("success", 0)), str(l.get("failed", 0))]
            for l in login_activity
        ]
        elements.append(_section_table(
            ["Date", "Successful", "Failed"],
            rows,
            col_widths=[6 * cm, 4 * cm, 4 * cm],
        ))

    # ── Security events timeline ──────────────────────────────────────────
    events = security.get("events", [])
    if events:
        elements.append(Paragraph("Security Event Timeline", styles["TrustSection"]))
        rows = [
            [
                e.get("sev", "").upper(),
                e.get("label", ""),
                e.get("detail", "")[:60],
                e.get("time", ""),
            ]
            for e in events
        ]
        elements.append(_section_table(
            ["Severity", "Event", "Detail", "Time"],
            rows,
            col_widths=[2.5 * cm, 4 * cm, 6.5 * cm, 3 * cm],
        ))

    # ── Unauthorized access attempts ──────────────────────────────────────
    attempts = security.get("unauthorized_attempts", [])
    if attempts:
        elements.append(Paragraph("Unauthorized Access Attempts", styles["TrustSection"]))
        rows = [
            [
                a.get("ip", ""),
                a.get("location", ""),
                str(a.get("target", ""))[:30],
                str(a.get("attempts", 0)),
                a.get("time", ""),
                "Blocked" if a.get("blocked") else "Flagged",
            ]
            for a in attempts
        ]
        elements.append(_section_table(
            ["IP", "Location", "Target", "Attempts", "When", "Status"],
            rows,
            col_widths=[3 * cm, 2.5 * cm, 4 * cm, 2 * cm, 2.5 * cm, 2 * cm],
        ))

    # Build PDF
    doc.build(elements, onFirstPage=_footer, onLaterPages=_footer)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes