from io import BytesIO
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


# ---------------------------------------------------------------------------
# Theme
# ---------------------------------------------------------------------------

NAVY = colors.HexColor("#172033")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#667085")
LIGHT = colors.HexColor("#F5F7FA")
BORDER = colors.HexColor("#D9E0E8")
WHITE = colors.white
GREEN = colors.HexColor("#15803D")
GREEN_BG = colors.HexColor("#ECFDF3")
RED = colors.HexColor("#C62828")
RED_BG = colors.HexColor("#FEF2F2")
AMBER = colors.HexColor("#B45309")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _value(value, default="N/A"):
    if value is None or value == "":
        return default
    return str(value)


def _format_score(value, digits=2):
    if value is None:
        return "N/A"
    try:
        return f"{float(value):.{digits}f}"
    except (TypeError, ValueError):
        return str(value)


def _safe_text(value):
    return (
        _value(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _result_colors(result):
    if result == "PASS":
        return GREEN, GREEN_BG
    if result == "REJECT":
        return RED, RED_BG
    return MUTED, LIGHT


def _build_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="BrandTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=21,
        leading=25,
        textColor=NAVY,
        alignment=TA_LEFT,
        spaceAfter=2,
    ))

    styles.add(ParagraphStyle(
        name="BrandSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=MUTED,
    ))

    styles.add(ParagraphStyle(
        name="Section",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=13,
        textColor=NAVY,
        spaceBefore=3,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        name="BodySmall",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=INK,
    ))

    styles.add(ParagraphStyle(
        name="TableHead",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.2,
        leading=9,
        textColor=WHITE,
    ))

    styles.add(ParagraphStyle(
        name="TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.3,
        leading=9,
        textColor=INK,
    ))

    styles.add(ParagraphStyle(
        name="TableCellMuted",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.1,
        leading=9,
        textColor=MUTED,
    ))

    styles.add(ParagraphStyle(
        name="CardLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=6.6,
        leading=8,
        textColor=MUTED,
    ))

    styles.add(ParagraphStyle(
        name="CardValue",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=14,
        textColor=NAVY,
    ))

    styles.add(ParagraphStyle(
        name="CenterVerdict",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=20,
        alignment=TA_CENTER,
    ))

    return styles


def _cell(value, styles, muted=False):
    return Paragraph(
        _safe_text(value),
        styles["TableCellMuted" if muted else "TableCell"],
    )


def _metric_card(label, value, styles, width=53 * mm, value_color=NAVY):
    """Render a compact KPI card with the label and value stacked vertically."""
    value_style = ParagraphStyle(
        name=f"MetricValue{abs(hash((label, str(value))))}",
        parent=styles["CardValue"],
        textColor=value_color,
    )

    return Table(
        [
            [Paragraph(_safe_text(label.upper()), styles["CardLabel"])],
            [Paragraph(_safe_text(value), value_style)],
        ],
        colWidths=[width],
        rowHeights=[7 * mm, 9 * mm],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
            ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]),
    )


def _section_banner(title, styles, width):
    return Table(
        [[Paragraph(_safe_text(title.upper()), styles["Section"])]],
        colWidths=[width],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
            ("LINEBELOW", (0, 0), (-1, -1), 0.8, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]),
    )


def _header_footer(canvas, doc):
    canvas.saveState()
    width, height = doc.pagesize

    canvas.setStrokeColor(BORDER)
    canvas.line(18 * mm, height - 20 * mm, width - 18 * mm, height - 20 * mm)

    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.setFillColor(NAVY)
    canvas.drawString(18 * mm, height - 15 * mm, "VISIONINSPECT AI")

    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(
        width - 18 * mm,
        height - 15 * mm,
        "AI Manufacturing Quality Inspection",
    )

    canvas.setStrokeColor(BORDER)
    canvas.line(18 * mm, 13 * mm, width - 18 * mm, 13 * mm)

    canvas.setFont("Helvetica", 7)
    canvas.drawString(
        18 * mm,
        8 * mm,
        "VisionInspect AI • Confidential Quality Inspection Report",
    )
    canvas.drawRightString(
        width - 18 * mm,
        8 * mm,
        f"Page {doc.page}",
    )
    canvas.restoreState()


def _history_header_footer(canvas, doc):
    canvas.saveState()
    width, height = doc.pagesize

    canvas.setStrokeColor(BORDER)
    canvas.line(14 * mm, height - 18 * mm, width - 14 * mm, height - 18 * mm)

    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.setFillColor(NAVY)
    canvas.drawString(14 * mm, height - 13 * mm, "VISIONINSPECT AI")

    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(
        width - 14 * mm,
        height - 13 * mm,
        "Inspection History • Quality Operations",
    )

    canvas.setStrokeColor(BORDER)
    canvas.line(14 * mm, 11 * mm, width - 14 * mm, 11 * mm)

    canvas.setFont("Helvetica", 7)
    canvas.drawString(
        14 * mm,
        6 * mm,
        "VisionInspect AI • Confidential Quality Inspection Report",
    )
    canvas.drawRightString(width - 14 * mm, 6 * mm, f"Page {doc.page}")
    canvas.restoreState()


# ---------------------------------------------------------------------------
# Single inspection PDF
# ---------------------------------------------------------------------------

def generate_single_inspection_pdf(entry):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=25 * mm,
        bottomMargin=18 * mm,
        title=f"VisionInspect AI - Inspection {entry.id}",
        author="VisionInspect AI",
    )

    styles = _build_styles()
    story = []
    content_width = 170 * mm

    result = _value(entry.result)
    verdict = "PASS" if result == "PASS" else "REJECT" if result == "REJECT" else result
    verdict_color, verdict_bg = _result_colors(verdict)

    # Title
    story.append(Table(
        [[
            Paragraph("VisionInspect AI", styles["BrandTitle"]),
            Paragraph(
                f"<b>INSPECTION #{_safe_text(entry.id)}</b><br/>"
                f"<font color='#667085'>Quality Inspection Report</font>",
                styles["BrandSubtitle"],
            ),
        ]],
        colWidths=[115 * mm, 55 * mm],
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]),
    ))

    story.append(Spacer(1, 2))
    story.append(Paragraph(
        "AI-assisted manufacturing defect detection and quality assessment",
        styles["BrandSubtitle"],
    ))
    story.append(Spacer(1, 8))

    # Verdict
    verdict_subtitle = (
        "Product meets the configured quality criteria."
        if verdict == "PASS"
        else "Product requires quality review / rejection."
        if verdict == "REJECT"
        else "Inspection completed with an unspecified result."
    )

    story.append(Table(
        [[Paragraph(
            f"<font color='{verdict_color.hexval()}'><b>{verdict}</b></font><br/>"
            f"<font size='8' color='#667085'>{verdict_subtitle}</font>",
            ParagraphStyle(
                name=f"Verdict{abs(hash(verdict))}",
                parent=styles["CenterVerdict"],
                textColor=verdict_color,
            ),
        )]],
        colWidths=[content_width],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), verdict_bg),
            ("BOX", (0, 0), (-1, -1), 1.1, verdict_color),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ]),
    ))
    story.append(Spacer(1, 7))

    # Details
    story.append(_section_banner("Inspection Details", styles, content_width))
    story.append(Spacer(1, 3))

    created_at = (
        entry.created_at.strftime("%Y-%m-%d %H:%M:%S")
        if entry.created_at else "N/A"
    )

    details = [
        ["Inspection ID", entry.id, "Inspector", entry.username],
        ["Image", entry.image_name, "Category", entry.category],
        ["Defect Class", entry.defect, "Result", entry.result],
        ["Date & Time", created_at, "Severity", entry.severity_level],
    ]

    detail_rows = []
    for row in details:
        detail_rows.append([
            Paragraph(f"<b>{_safe_text(row[0])}</b>", styles["TableCellMuted"]),
            _cell(row[1], styles),
            Paragraph(f"<b>{_safe_text(row[2])}</b>", styles["TableCellMuted"]),
            _cell(row[3], styles),
        ])

    story.append(Table(
        detail_rows,
        colWidths=[30 * mm, 55 * mm, 30 * mm, 55 * mm],
        style=TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]),
    ))
    story.append(Spacer(1, 7))

    # AI analysis cards
    story.append(_section_banner("AI Inspection Analysis", styles, content_width))
    story.append(Spacer(1, 3))

    try:
        confidence = float(entry.confidence or 0)
    except (TypeError, ValueError):
        confidence = 0

    level = _value(entry.severity_level).lower()
    severity_color = (
        RED if level == "critical"
        else AMBER if level in {"high", "medium"}
        else GREEN if level == "low"
        else NAVY
    )

    card_width = 52 * mm
    row1 = Table(
        [[
            _metric_card("Confidence", f"{_format_score(entry.confidence, 2)}%", styles, card_width,
                         GREEN if confidence >= 90 else NAVY),
            _metric_card("Anomaly Score", _format_score(entry.anomaly_score, 4), styles, card_width),
            _metric_card("Threshold", _format_score(entry.threshold, 4), styles, card_width),
        ]],
        colWidths=[55 * mm, 55 * mm, 55 * mm],
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]),
    )
    story.append(row1)
    story.append(Spacer(1, 4))

    processing = (
        f"{_format_score(entry.processing_time_ms)} ms"
        if entry.processing_time_ms is not None else "N/A"
    )

    row2 = Table(
        [[
            _metric_card("Severity Score", _format_score(entry.severity_score, 2),
                         styles, card_width, severity_color),
            _metric_card("Severity Level", _value(entry.severity_level),
                         styles, card_width, severity_color),
            _metric_card("Processing Time", processing, styles, card_width),
        ]],
        colWidths=[55 * mm, 55 * mm, 55 * mm],
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]),
    )
    story.append(row2)
    story.append(Spacer(1, 7))

    # Recommended action
    story.append(_section_banner("Recommended Action", styles, content_width))
    story.append(Spacer(1, 3))

    story.append(Table(
        [[Paragraph(_safe_text(entry.recommended_action), styles["BodySmall"])]],
        colWidths=[content_width],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
            ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]),
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph(
        "Generated automatically by VisionInspect AI. "
        "Values shown are recorded from the AI-assisted inspection pipeline.",
        styles["BrandSubtitle"],
    ))

    doc.build(story, onFirstPage=_header_footer, onLaterPages=_header_footer)
    buffer.seek(0)
    return buffer.getvalue()


# ---------------------------------------------------------------------------
# History PDF
# ---------------------------------------------------------------------------

def generate_history_pdf(entries, title="Inspection History Report"):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=14 * mm,
        leftMargin=14 * mm,
        topMargin=23 * mm,
        bottomMargin=16 * mm,
        title=title,
        author="VisionInspect AI",
    )

    styles = _build_styles()
    story = []
    content_width = 269 * mm

    total = len(entries)
    passed = sum(1 for entry in entries if entry.result == "PASS")
    rejected = sum(1 for entry in entries if entry.result == "REJECT")
    pass_rate = (passed / total) * 100 if total else 0

    # Header block
    story.append(Table(
        [[
            Paragraph("VisionInspect AI", styles["BrandTitle"]),
            Paragraph(
                f"<b>{_safe_text(title)}</b><br/>"
                f"<font color='#667085'>Quality Operations Summary</font>",
                styles["BrandSubtitle"],
            ),
        ]],
        colWidths=[205 * mm, 64 * mm],
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]),
    ))

    story.append(Spacer(1, 2))
    story.append(Paragraph(
        "Consolidated inspection history for manufacturing quality monitoring.",
        styles["BrandSubtitle"],
    ))
    story.append(Spacer(1, 8))

    # Summary cards
    summary_card_width = 64 * mm
    story.append(Table(
        [[
            _metric_card("Total Inspections", total, styles, summary_card_width),
            _metric_card("Passed", passed, styles, summary_card_width, GREEN),
            _metric_card("Rejected", rejected, styles, summary_card_width, RED),
            _metric_card("Pass Rate", f"{pass_rate:.2f}%", styles, summary_card_width, GREEN),
        ]],
        colWidths=[67.25 * mm] * 4,
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ]),
    ))
    story.append(Spacer(1, 9))

    story.append(_section_banner("Inspection History", styles, content_width))
    story.append(Spacer(1, 3))

    data = [[
        "ID", "User", "Image", "Category", "Defect", "Result",
        "Severity", "Confidence", "Severity Score", "Date"
    ]]

    for entry in entries:
        data.append([
            _value(entry.id),
            _value(entry.username),
            _value(entry.image_name),
            _value(entry.category),
            _value(entry.defect),
            _value(entry.result),
            _value(entry.severity_level),
            f"{_format_score(entry.confidence, 1)}%" if entry.confidence is not None else "N/A",
            _format_score(entry.severity_score, 2),
            entry.created_at.strftime("%Y-%m-%d") if entry.created_at else "N/A",
        ])

    wrapped = []
    for row_index, row in enumerate(data):
        output_row = []

        for col_index, value in enumerate(row):
            if row_index == 0:
                output_row.append(Paragraph(_safe_text(value), styles["TableHead"]))
                continue

            if col_index == 5:
                color, _ = _result_colors(str(value))
                output_row.append(Paragraph(
                    f"<b><font color='{color.hexval()}'>{_safe_text(value)}</font></b>",
                    styles["TableCell"],
                ))
            elif col_index == 6:
                level = str(value).lower()
                color = (
                    RED if level == "critical"
                    else AMBER if level in {"high", "medium"}
                    else GREEN if level == "low"
                    else MUTED
                )
                output_row.append(Paragraph(
                    f"<b><font color='{color.hexval()}'>{_safe_text(value)}</font></b>",
                    styles["TableCell"],
                ))
            else:
                output_row.append(_cell(value, styles))

        wrapped.append(output_row)

    history_table = Table(
        wrapped,
        colWidths=[
            11 * mm, 31 * mm, 31 * mm, 27 * mm, 30 * mm,
            21 * mm, 25 * mm, 25 * mm, 27 * mm, 28 * mm,
        ],
        repeatRows=1,
        hAlign="LEFT",
    )

    history_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 1), (0, -1), "CENTER"),
        ("ALIGN", (5, 1), (6, -1), "CENTER"),
        ("ALIGN", (7, 1), (8, -1), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))

    story.append(history_table)
    story.append(Spacer(1, 7))

    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    story.append(Paragraph(
        f"Report generated on {generated}. "
        "This document summarizes recorded AI-assisted manufacturing inspections.",
        styles["BrandSubtitle"],
    ))

    doc.build(
        story,
        onFirstPage=_history_header_footer,
        onLaterPages=_history_header_footer,
    )

    buffer.seek(0)
    return buffer.getvalue()