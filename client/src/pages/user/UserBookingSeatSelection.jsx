import React, { useState, useEffect } from 'react';
import './SeatSelection.css';

// rows, cols, onSeatSelect(선택된 좌석 리스트를 부모에게 전달)를 props로 받음
const SeatSelection = ({ rows, cols, onSeatSelect }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const SEAT_PRICE = 110000;

  useEffect(() => {
    // 공연장 규모에 맞는 초기 좌석 생성
    const newSeats = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() < 0.15 ? 1 : 0))
    );
    setSeats(newSeats);
    setSelectedSeats([]); 
  }, [rows, cols]);

  const handleSeatClick = (rowIndex, seatIndex) => {
    if (seats[rowIndex][seatIndex] === 1) return;
    const seatId = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;
    
    let updatedSeats;
    if (selectedSeats.includes(seatId)) {
      updatedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
      updatedSeats = [...selectedSeats, seatId];
    }
    
    setSelectedSeats(updatedSeats);
    onSeatSelect(updatedSeats); // 부모 컴포넌트에 선택 데이터 전달
  };

  return (
    <div className="seat-selection-component">
      <div className="stage">STAGE</div>
      <div className="seat-grid-wrapper">
        <div className="seat-grid">
          {seats.map((row, rIdx) => (
            <div key={rIdx} className="seat-row">
              <span className="row-label">{String.fromCharCode(65 + rIdx)}</span>
              {row.map((status, sIdx) => {
                const seatId = `${String.fromCharCode(65 + rIdx)}${sIdx + 1}`;
                const isSelected = selectedSeats.includes(seatId);
                return (
                  <div
                    key={sIdx}
                    className={`seat ${status === 1 ? 'reserved' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSeatClick(rIdx, sIdx)}
                  >
                    {sIdx + 1}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* 범례 및 요약은 생략 가능 (부모에서 관리해도 됨) */}
    </div>
  );
};

export default SeatSelection;