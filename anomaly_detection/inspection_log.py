import datetime
import uuid
import threading
from collections import Counter

class ThreadSafeInspectionLog:
    """
    A thread-safe, in-memory log that stores recent inspection records.
    Maintains a maximum capacity of 500 items using a FIFO queue strategy.
    """
    def __init__(self, max_capacity: int = 500):
        self.max_capacity = max_capacity
        self.lock = threading.Lock()
        self.log = []

    def add_entry(self, category: str, is_anomaly: bool, anomaly_score: float, threshold: float, severity_score: float, severity_level: str, recommended_action: str, inferred_defect_type: str, severity_breakdown: dict, quality_report: dict, filename: str = None) -> str:
        """Adds a new inspection record to the log, maintaining max capacity."""
        inspection_id = str(uuid.uuid4())
        timestamp = datetime.datetime.now().isoformat()
        
        entry = {
            "inspection_id": inspection_id,
            "timestamp": timestamp,
            "filename": filename or f"inspection_{inspection_id[:8]}.jpg",
            "category": category,
            "is_anomaly": is_anomaly,
            "anomaly_score": anomaly_score,
            "threshold": threshold,
            "severity_score": severity_score,
            "severity_level": severity_level,
            "recommended_action": recommended_action,
            "inferred_defect_type": inferred_defect_type,
            "severity_breakdown": severity_breakdown,
            "quality_report": quality_report
        }
        
        with self.lock:
            self.log.append(entry)
            # Maintain capacity limit
            if len(self.log) > self.max_capacity:
                self.log.pop(0)
                
        return inspection_id

    def get_all(self, limit: int = 50):
        """Returns the last N inspection records in reverse chronological order."""
        with self.lock:
            # Return copy to prevent external mutation
            return list(reversed(self.log[-limit:]))

    def get_by_id(self, inspection_id: str):
        """Retrieves a single inspection record by its ID."""
        with self.lock:
            for entry in self.log:
                if entry["inspection_id"] == inspection_id:
                    return dict(entry)
            return None

    def get_analytics(self):
        """Computes real-time statistics and defect distribution across all log entries."""
        with self.lock:
            total = len(self.log)
            if total == 0:
                return {
                    "total_inspections": 0,
                    "pass_rate": 100.0,
                    "defect_rate": 0.0,
                    "anomalous_count": 0,
                    "severity_distribution": {
                        "Critical": 0,
                        "High": 0,
                        "Medium": 0,
                        "Low": 0
                    },
                    "category_stats": {}
                }
            
            anomalous_count = sum(1 for entry in self.log if entry["is_anomaly"])
            pass_count = total - anomalous_count
            
            # Severity distribution
            severities = [entry["severity_level"] for entry in self.log]
            severity_counts = Counter(severities)
            
            # Category statistics
            categories = {}
            for entry in self.log:
                cat = entry["category"]
                if cat not in categories:
                    categories[cat] = {"total": 0, "anomalous": 0, "scores": []}
                
                categories[cat]["total"] += 1
                if entry["is_anomaly"]:
                    categories[cat]["anomalous"] += 1
                categories[cat]["scores"].append(entry["anomaly_score"])
            
            category_stats = {}
            for cat, data in categories.items():
                category_stats[cat] = {
                    "total": data["total"],
                    "anomalous": data["anomalous"],
                    "pass_rate": round(((data["total"] - data["anomalous"]) / data["total"]) * 100.0, 2),
                    "avg_anomaly_score": round(float(np.mean(data["scores"])), 6) if data["scores"] else 0.0
                }
                
            return {
                "total_inspections": total,
                "pass_rate": round((pass_count / total) * 100.0, 2),
                "defect_rate": round((anomalous_count / total) * 100.0, 2),
                "anomalous_count": anomalous_count,
                "severity_distribution": {
                    "Critical": severity_counts.get("Critical", 0),
                    "High": severity_counts.get("High", 0),
                    "Medium": severity_counts.get("Medium", 0),
                    "Low": severity_counts.get("Low", 0)
                },
                "category_stats": category_stats
            }

# Global singleton instance
inspection_log = ThreadSafeInspectionLog()

# Dynamic numpy import wrapper for analytics
import numpy as np
