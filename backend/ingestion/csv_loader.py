"""
CSV Loader - Parse CSV files into structured data and text
"""
import logging
import csv
from pathlib import Path
from typing import Tuple, List, Dict

logger = logging.getLogger("insightai.csv_loader")


def load_csv(file_path: str) -> Tuple[str, List[Dict], List[Dict]]:
    """
    Parse a CSV file.
    Returns: (text_representation, structured_rows, extracted_kpis)
    """
    try:
        import pandas as pd

        df = pd.read_csv(file_path)
        df = df.dropna(how="all")  # drop fully empty rows

        # Structured data as list of dicts
        structured = df.head(1000).to_dict(orient="records")

        # Convert numeric columns to native Python types
        for row in structured:
            for k, v in row.items():
                if hasattr(v, 'item'):  # numpy type
                    row[k] = v.item()
                elif isinstance(v, float) and v != v:  # NaN check
                    row[k] = None

        # Text representation for RAG
        text_lines = [f"CSV Data with columns: {', '.join(df.columns.tolist())}"]
        text_lines.append(f"Total rows: {len(df)}")
        text_lines.append("")
        text_lines.append(df.head(50).to_string(index=False))

        # Summary statistics for numeric columns
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        if numeric_cols:
            text_lines.append("\n\nSummary Statistics:")
            text_lines.append(df[numeric_cols].describe().to_string())

        # Extract KPIs
        kpis = _extract_kpis(df)

        text = "\n".join(text_lines)
        logger.info(f"Parsed CSV: {len(structured)} rows, {len(kpis)} KPIs")
        return text, structured, kpis

    except Exception as e:
        logger.error(f"CSV parsing failed: {e}")
        raise ValueError(f"Failed to parse CSV: {e}")


def _extract_kpis(df) -> List[Dict]:
    """Auto-extract KPIs from dataframe."""
    import pandas as pd
    kpis = []
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()

    # Find label column (first non-numeric column, often date/year/name)
    label_cols = df.select_dtypes(exclude=["number"]).columns.tolist()
    label_col = label_cols[0] if label_cols else None

    labels = []
    if label_col:
        labels = [str(v) for v in df[label_col].head(20).tolist()]

    for col in numeric_cols[:10]:  # limit to 10 KPI metrics
        values = df[col].head(20).tolist()
        clean_values = []
        for v in values:
            try:
                fv = float(v)
                if fv == fv:  # not NaN
                    clean_values.append(fv)
                else:
                    clean_values.append(0.0)
            except (ValueError, TypeError):
                clean_values.append(0.0)

        if clean_values:
            kpis.append({
                "metric": col,
                "values": clean_values,
                "labels": labels[:len(clean_values)] if labels else [str(i) for i in range(len(clean_values))],
            })

    return kpis
