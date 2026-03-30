import os
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        self.custom_styles = {
            'Title': ParagraphStyle(
                'CustomTitle',
                parent=self.styles['Heading1'],
                fontSize=24,
                spaceAfter=30,
                textColor=colors.HexColor("#1e293b"),
                alignment=1
            ),
            'Subtitle': ParagraphStyle(
                'CustomSubtitle',
                parent=self.styles['Normal'],
                fontSize=14,
                spaceAfter=20,
                textColor=colors.HexColor("#64748b"),
                alignment=1
            ),
            'Heading2': ParagraphStyle(
                'CustomHeading2',
                parent=self.styles['Heading2'],
                fontSize=16,
                spaceBefore=20,
                spaceAfter=10,
                textColor=colors.HexColor("#0f172a"),
                borderPadding=(0, 0, 4, 0)
            ),
            'Normal': ParagraphStyle(
                'CustomNormal',
                parent=self.styles['Normal'],
                fontSize=11,
                leading=16,
                spaceAfter=8,
                textColor=colors.HexColor("#334155")
            ),
            'Highlight': ParagraphStyle(
                'Highlight',
                parent=self.styles['Normal'],
                fontSize=11,
                leading=16,
                spaceBefore=10,
                spaceAfter=10,
                textColor=colors.HexColor("#047857"),
                backColor=colors.HexColor("#d1fae5"),
                borderPadding=10,
                borderColor=colors.HexColor("#10b981"),
                borderWidth=1,
                borderRadius=5
            )
        }

    def generate_pdf(self, title, data):
        """
        Generates a professional PDF report.
        `data` should be a dict containing insights, trends, risks, opportunities, recommendations, and kpis.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=inch,
            leftMargin=inch,
            topMargin=inch,
            bottomMargin=inch
        )

        story = []

        # Cover Page
        story.append(Spacer(1, 2 * inch))
        story.append(Paragraph(title, self.custom_styles['Title']))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y')}", self.custom_styles['Subtitle']))
        story.append(Spacer(1, 3 * inch))

        # Helper function for sections
        def add_section(header, items, style='Normal', bullet=True):
            if items:
                story.append(Paragraph(header, self.custom_styles['Heading2']))
                story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))
                for item in items:
                    prefix = "• " if bullet else ""
                    story.append(Paragraph(f"{prefix}{item}", self.custom_styles[style]))
                story.append(Spacer(1, 0.2 * inch))

        # Content Sections
        if data.get("summary"):
            story.append(Paragraph("Executive Summary", self.custom_styles['Heading2']))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))
            story.append(Paragraph(data["summary"], self.custom_styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))

        add_section("Key Insights", data.get("insights", []))
        add_section("Trends Analysis", data.get("trends", []))
        add_section("Risk Assessment", data.get("risks", []))
        add_section("Opportunities", data.get("opportunities", []))
        
        # Recommendations (highlighted)
        if data.get("recommendations"):
            story.append(Paragraph("Recommendations", self.custom_styles['Heading2']))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))
            for rec in data.get("recommendations", []):
                story.append(Paragraph(f"• {rec}", self.custom_styles['Highlight']))
            story.append(Spacer(1, 0.2 * inch))

        # KPIs Section
        if data.get("kpis"):
            story.append(Paragraph("KPI Tables", self.custom_styles['Heading2']))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))
            for kpi in data["kpis"]:
                # Assume kpi is a dict with metric, labels, values
                story.append(Paragraph(f"Metric: {kpi.get('metric', '')}", self.custom_styles['Normal']))
                
                table_data = [["Label", "Value"]]
                labels = kpi.get('labels', [])
                values = kpi.get('values', [])
                for i in range(max(len(labels), len(values))):
                    l = labels[i] if i < len(labels) else ""
                    v = str(values[i]) if i < len(values) else ""
                    table_data.append([l, v])
                
                t = Table(table_data, colWidths=[3*inch, 2*inch])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor("#0f172a")),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,-1), 10),
                    ('BOTTOMPADDING', (0,0), (-1,0), 12),
                    ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#ffffff")),
                    ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
                ]))
                story.append(t)
                story.append(Spacer(1, 0.2 * inch))

        # Sources
        add_section("Sources", data.get("sources", []))

        # Build PDF
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
