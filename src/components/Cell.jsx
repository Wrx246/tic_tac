import React from 'react'

const Cell = ({ num, step, cells, handleClick }) => {
    return (
      <td className="cell" onClick={step === true ? () => handleClick(num) : null}>
        <span>{cells[num]}</span>
      </td>
    );
  };

export default Cell