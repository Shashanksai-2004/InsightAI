"""
Excel Loader - Parse XLSX files into structured data and text
"""
import logging
from pathlib import Path
from typing import Tuple, List, Dict

logger = logging.getLogger("insightai.excel_loader")


def load_excel(file_path: str) -> Tuple[str, List[Dict], List[Dict]]:
    """
    Parse an Excel file.
    Returns: (text_representation, structured_rows, extracted_kpis)
    """
    try:
        import pandas as pd

        # Read all sheets
        xls = pd.ExcelFile(file_path)
        all_text = []
        all_structured = []
        all_kpis = []

        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            df = df.dropna(how="all")

            if df.empty:
                continue

            # Structured data
            sheet_data = df.head(1000).to_dict(orient="records")
            for row in sheet_data:
                for k, v in row.items():
                    if hasattr(v, 'item'):
                        row[k] = v.item()
                    elif isinstance(v, float) and v != v:
                        row[k] = None
                row["_sheet"] = sheet_name
            all_structured.extend(sheet_data)

            # Text representation
            all_text.append(f"\n[Sheet: {sheet_name}]")
            all_text.append(f"Columns: {', '.join(df.columns.tolist())}")
            all_text.append(f"Rows: {len(df)}")
            all_text.append(df.head(50).to_string(index=False))

            # Summary stats
            numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
            if numeric_cols:
                all_text.append(f"\nSummary Statistics ({sheet_name}):")
                all_text.append(df[numeric_cols].describe().to_string())

            # KPI extraction
            kpis = _extract_kpis(df, sheet_name)
            all_kpis.extend(kpis)

        text = "\n".join(all_text)
        logger.info(f"Parsed Excel: {len(xls.sheet_names)} sheets, {len(all_structured)} rows, {len(all_kpis)} KPIs")
        return text, all_structured, all_kpis

    except Exception as e:
        logger.error(f"Excel parsing failed: {e}")
        raise ValueError(f"Failed to parse Excel: {e}")


def _extract_kpis(df, sheet_name: str = "") -> List[Dict]:
    """Auto-extract KPIs from a dataframe sheet."""
    kpis = []
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    label_cols = df.select_dtypes(exclude=["number"]).columns.tolist()
    label_col = label_cols[0] if label_cols else None

    labels = []
    if label_col:
        labels = [str(v) for v in df[label_col].head(20).tolist()]

    for col in numeric_cols[:10]:
        values = df[col].head(20).tolist()
        clean_values = []
        for v in values:
            try:
                fv = float(v)
                if fv == fv:
                    clean_values.append(fv)
                else:
                    clean_values.append(0.0)
            except (ValueError, TypeError):
                clean_values.append(0.0)

        if clean_values:
            metric_name = f"{col}" if not sheet_name else f"{col}"
            kpis.append({
                "metric": metric_name,
                "values": clean_values,
                "labels": labels[:len(clean_values)] if labels else [str(i) for i in range(len(clean_values))],
            })

    return kpis
