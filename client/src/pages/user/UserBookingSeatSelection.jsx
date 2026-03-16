import React, { useState } from 'react';

/**
 * 🌟 핵심 수정 사항: 
 * 부모에서 진짜 예매된 좌석(reservedSeats)과 
 * 사용자가 선택한 티켓 매수(ticketCount)를 props로 받아옴.
 */
const SeatSelection = ({ rows, cols, ticketCount, reservedSeats = [], onSeatSelect }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  // 좌석 클릭 핸들러
  const handleSeatClick = (rowIndex, seatIndex) => {
    // 1. 좌석 ID 생성 (예: A1, B2)
    const seatId = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;

    // 2. 🌟 이미 DB에서 판매된 좌석(reservedSeats)이면 클릭 무시!
    if (reservedSeats.includes(seatId)) return;

    let updatedSeats;

    // 3. 이미 선택한 좌석을 다시 클릭한 경우 -> 선택 해제
    if (selectedSeats.includes(seatId)) {
      updatedSeats = selectedSeats.filter(id => id !== seatId);
    } 
    // 4. 새로 선택하는 경우
    else {
      // 🌟 [핵심] 부모에서 넘겨준 인원수(ticketCount)보다 많아지지 않게 체크
      if (selectedSeats.length >= ticketCount) {
        alert(`최대 ${ticketCount}개까지만 선택 가능합니다.`); // 매수 제한 알림
        return; 
      }
      updatedSeats = [...selectedSeats, seatId];
    }
    
    // 5. 상태 업데이트 및 부모 전달
    setSelectedSeats(updatedSeats);
    onSeatSelect(updatedSeats); 
  };

  return (
    <div className="seat-selection-component">
      <div className="stage">STAGE</div>
      <div className="seat-grid-wrapper">
        <div className="seat-grid">
          {/* Math.random() 다 지우고 rows/cols 만큼 깔끔하게 반복문 돌림 */}
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="seat-row">
              <span className="row-label">{String.fromCharCode(65 + rIdx)}</span>
              {Array.from({ length: cols }).map((_, sIdx) => {
                const seatId = `${String.fromCharCode(65 + rIdx)}${sIdx + 1}`;
                
                // 🌟 상태 체크 로직
                const isSelected = selectedSeats.includes(seatId);
                const isReserved = reservedSeats.includes(seatId); // DB 데이터 기반!

                return (
                  <div
                    key={sIdx}
                    // isReserved가 true면 'reserved' 클래스(까만색 등) 적용
                    className={`seat ${isReserved ? 'reserved' : ''} ${isSelected ? 'selected' : ''}`}
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
    </div>
  );
};

export default SeatSelection;