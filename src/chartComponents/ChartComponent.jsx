import React from 'react';
import { Preloader, Container } from 'react-materialize';

import TwitterDoughnut from './twitterDoughnut';
import ChiSquared from './chiSquared';
import LineGraph from './lineGraph';
import TCEHistogram from './histogram';

export default (Wrapper) => {

  return (chartObject, index) => {
    if (!chartObject.data) {
      return <Wrapper><Container><Preloader size="big" flashing /></Container></Wrapper>;
    }
    let Chart;
    switch (chartObject.type) {
      case 'doughnut':
        Chart = TwitterDoughnut;
        break;
      case 'line':
        Chart = LineGraph;
        break;
      case 'histogram':
        Chart = TCEHistogram;
        break;
      case 'chiSquared':
        Chart = ChiSquared;
        break;
      default:
        return null;
    }
    return (<Wrapper
      icon={chartObject.icon}
      index={index}
      chartObject={chartObject}
    >
      <Chart data={chartObject.data} />
    </Wrapper>);
  };
};