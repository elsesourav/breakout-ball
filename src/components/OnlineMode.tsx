import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { CANVAS_WIDTH } from '../constants/game';
import { levelSearchEngine } from '../services/search';

const ITEMS_PER_PAGE = 8;

export const OnlineMode: React.FC = () => {
  const { onlineLevels, openPreview } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLevels = useMemo(() => {
    return levelSearchEngine.search(onlineLevels, searchTerm);
  }, [onlineLevels, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLevels.length / ITEMS_PER_PAGE));

  const pageLevels = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLevels.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLevels, currentPage]);

  return (
    <div className="map extra" id="onlineMap">
      <div className="top">
        <div className="box">
          <i className="sbi-search" />
          <input
            type="text"
            id="searchInput"
            placeholder="Search Level ID"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            spellCheck="false"
            autoComplete="off"
          />
        </div>
      </div>

      <div id="onlineMode" className="inner">
        {pageLevels.map((lvl) => (
          <OnlineLevelCard
            key={lvl.id}
            level={lvl}
            onClick={() => openPreview(lvl)}
          />
        ))}

        {pageLevels.length === 0 && (
          <div style={{ color: '#aaa', textAlign: 'center', gridColumn: 'span 2', padding: '40px 10px', fontFamily: 'f3' }}>
            No levels found matching "{searchTerm}"
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div id="pages">
          <div
            className={`page show ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
          >
            &lt;
          </div>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <div
                key={pageNum}
                className={`page show ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </div>
            );
          })}

          <div
            className={`page show ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
          >
            &gt;
          </div>
        </div>
      )}
    </div>
  );
};

const OnlineLevelCard: React.FC<{ level: LevelData; onClick: () => void }> = ({ level, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawLevelPreviewOnCanvas(canvasRef.current, level.blocks, 240, 240);
    }
  }, [level]);

  return (
    <div className="level show" onClick={onClick}>
      <canvas
        ref={canvasRef}
        className="levelCvs"
        width={CANVAS_WIDTH}
        height={CANVAS_WIDTH * 0.9}
      />
      <div className="details">
        <div className="playCount">
          <i className="sbi-play-circle" />
          <p className="count">{level.playCount}</p>
        </div>
        <p className="id">{level.id}</p>
      </div>
    </div>
  );
};
