// client/src/features/analytics/components/panels/TopSharedFiles.js
/**
 * Top Shared Files panel — ranked list with progress bars.
 * Data + labels from backend.
 */

import React from "react";
import { motion } from "framer-motion";
import { Eye, Download } from "lucide-react";
import Card, { CardHeader } from "../shared/Card";
import Skeleton   from "../shared/Skeleton";
import EmptyState from "../shared/EmptyState";

export default function TopSharedFiles({
  topFiles = [],
  loading  = false,
  config   = {},
}) {
  const title = config.title || "Top Shared Files";
  const meta  = config.meta  || "by opens";
  const empty = config.empty || "No shared files yet.";

  return (
    <Card delay={0.15} noPadding>
      <CardHeader
        title={title}
        right={<span className="an-chart-meta">{meta}</span>}
        borderBottom
      />

      {loading ? (
        <div className="an-top-files">
          {[100, 54, 38, 29, 25].map((w, i) => (
            <div key={i} className="an-top-file-skeleton">
              <div className="an-top-file-skeleton-row">
                <Skeleton style={{ width: "60%", height: 12 }} />
                <Skeleton style={{ width: "15%", height: 12 }} />
              </div>
              <Skeleton
                style={{ width: `${w}%`, height: 4, borderRadius: 999 }}
              />
            </div>
          ))}
        </div>
      ) : !topFiles.length ? (
        <div className="an-top-files-empty">
          <EmptyState message={empty} />
        </div>
      ) : (
        <div className="an-top-files">
          {topFiles.map((f, i) => (
            <motion.div
              key={f.name + i}
              className="an-top-file-row"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x:  0 }}
              transition={{
                duration: 0.35,
                delay:    0.15 + i * 0.06,
                ease:     [0.32, 0.72, 0, 1],
              }}
              whileHover={{ backgroundColor: "var(--an-top-file-hover-bg)" }}
            >
              {/* Header row */}
              <div className="an-top-file-header">
                <span className="an-top-file-rank">{f.rank}</span>
                <p className="an-top-file-name">{f.name}</p>
                <div className="an-top-file-stats">
                  <span className="an-top-file-stat">
                    <Eye size={10} /> {f.opens}
                  </span>
                  <span className="an-top-file-stat">
                    <Download size={10} /> {f.downloads}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="an-top-file-track">
                <motion.div
                  className="an-top-file-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${f.pct}%` }}
                  transition={{
                    duration: 0.8,
                    delay:    0.2 + i * 0.08,
                    ease:     "easeOut",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}