import React, { Component } from 'react';
import { Row, Col, Input, Button, Preloader, Card, Collapsible, CollapsibleItem } from 'react-materialize';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import { connect } from 'react-redux';
import axios from 'axios';

class QueryBuilder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      recipientsGender: -1,
      senderGender: -1,
      sentiment: undefined,
      followerCount: {
        min: undefined,
        max: undefined,
      },
    };
    this.query = this.query.bind(this);
    this.resultsIndex = 0;
    this.props.clearResults();
  }

  query() {
    this.props.clearResults();
    const keyword = this.state.keyword;
    const senderGender = Number(this.state.senderGender);
    const recipientsGender = this.state.recipientsGender;
    const sentiment = this.state.sentiment;
    const senderFollowerMin = this.state.followerCount.min;
    const senderFollowerMax = this.state.followerCount.max;
    this.setState({ loading: true });
    const endLoading = () => this.setState({ loading: false });
    axios.post('/api/KeywordAcrossGender', { keyword, recipientsGender, sentiment, senderFollowerMin, senderFollowerMax })
      .then(res =>
        this.props.addToResults([
          //{ type: 'doughnut', icon: 'pie_chart', data: res.data, title: `Breakdown of "${keyword}" by Gender`, keyword, resultsIndex: this.resultsIndex++ },
          { type: 'chiSquared', icon: 'format_list_numbered', data: res.data, title: `Breakdown of "${keyword}" by Gender`, keyword, params: { columnA: 'Female', dataNameA: 'femaleSender', columnB: 'Male', dataNameB: 'maleSender' } , resultsIndex: this.resultsIndex++ },
        ]))
      .then(endLoading);
    axios.post('/api/SelectionsOverTime', { keyword, senderGender, recipientsGender, sentiment, senderFollowerMin, senderFollowerMax })
      .then(res =>
        this.props.addToResults({
          type: 'line',
          icon: 'show_chart',
          data: res.data,
          title: `Breakdown of Use of "${keyword}" by Time for ${senderGender ? 'women' : 'men'}`,
          keyword,
          resultsIndex: this.resultsIndex++,
        }),
      );
    // axios.post('/api/BucketedBarChart', { keyword })
    //   .then(res =>
    //     this.props.addToResults({
    //       type: 'histogram',
    //       icon: 'insert_chart',
    //       data: res.data,
    //       title: `Breakdown of Use of "${keyword}" by Gender`,
    //       keyword,
    //       resultsIndex: this.resultsIndex++,
    //     }),
    //   );
    // axios.post('/api/BucketedBarChartBodySentiment', { keyword })
    //   .then(res =>
    //     this.props.addToResults({
    //       type: 'histogram',
    //       icon: 'insert_chart',
    //       data: res.data,
    //       title: `Breakdown of Use of "${keyword}" by Sentiment`,
    //       keyword,
    //       resultsIndex: this.resultsIndex++,
    //     }),
    //   );
    axios.post('/api/KeywordAcrossFollowerCount', { keyword, senderGender, recipientsGender, sentiment })
      .then(res =>
        this.props.addToResults(
          { type: 'chiSquared', icon: 'format_list_numbered', data: res.data, title: `Breakdown of "${keyword}" by Follower Count`, keyword, params: { columnA: 'Over 500 Followers', columnB: 'Under 500 Followers', dataNameA: 'over500followers', dataNameB: 'under500followers' }, resultsIndex: this.resultsIndex++ }),
      );
    axios.post('/api/KeywordAcrossSentiment', { keyword, senderGender, recipientsGender, senderFollowerMin, senderFollowerMax })
      .then(res =>
        this.props.addToResults(
          { type: 'chiSquared', icon: 'format_list_numbered', data: res.data, title: `Breakdown of "${keyword}" by Sentiment`, keyword, params: { columnA: 'Positive Sentiment', columnB: 'Negative Sentiment', dataNameA: 'positiveSentiment', dataNameB: 'negativeSentiment' }, resultsIndex: this.resultsIndex++ }),
      );
  }

  render() {
    return (
      <Card title="Build Your Query" style={{ textAlign: 'center' }}>
        <Row />
        <Collapsible popout defaultActiveKey={0}>
          <CollapsibleItem header="Gender" icon="wc" style={{ textAlign: 'left' }} >
            <Row>
              <Input s={6} type="select" label="Gender of Sender's Tweets" defaultValue={-1} onChange={event => this.setState({ senderGender: event.target.value })} >
                <option value={0}>Male</option>
                <option value={1}>Female</option>
                <option value={-1}>None</option>
              </Input>
              <Input s={6} type="select" label="Gender of Recipients Tweets" defaultValue={-1} onChange={event => this.setState({ recipientsGender: event.target.value })} >
                <option value={0}>Male</option>
                <option value={1}>Female</option>
                <option value={-1}>None</option>
              </Input>
            </Row>
          </CollapsibleItem>
          <CollapsibleItem header="Keyword" icon="create" style={{ textAlign: 'left' }}>
            <Row>
              <Input label="Enter a Keyword" s={12} onChange={event => this.setState({ keyword: event.target.value })} />
            </Row>
          </CollapsibleItem>
          <CollapsibleItem header="Sentiment" icon="insert_emoticon" style={{ textAlign: 'left' }}>
            <Row>
              <Input s={12} type="select" label="Sentiment of Tweets" defaultValue={1} onChange={event => this.setState({ sentiment: event.target.value })} >
                <option value={-1}>:(</option>
                <option value={1}>:)</option>
              </Input>
            </Row>
          </CollapsibleItem>
          <CollapsibleItem header="Follower Count" icon="group" style={{ textAlign: 'left' }}>
            <Row>
              <InputRange
                draggableTrack
                maxValue={'1000000'.toLocaleString()}
                minValue={0}
                step={500}
                formatLabel={value => `${value} followers`}
                value={this.state.followerCount}
                onChangeComplete={value => this.setState({ followerCount: value })}
              />
            </Row>
          </CollapsibleItem>
          <Row />
          <Row>
            <Col m={6}>
              <Button onClick={this.query} >Submit</Button>
            </Col>
            <Col m={6}>
              {this.state.loading ? <Preloader big flashing /> : null}
            </Col>
          </Row>
        </Collapsible>
      </Card>
    );
  }
}

const mapStateToProps = state => ({
  charts: state.charts,
  favourites: state.favourites,
  boards: state.boards,
});

const mapDispatchToProps = dispatch => ({
  addToResults: results => dispatch({ type: 'RESULTS_RECEIVED', results }),
  loadingResults: () => dispatch({ type: 'RESULTS_RESET' }),
  clearResults: () => dispatch({ type: 'RESULTS_CLEAR' }),
});

export default connect(mapStateToProps, mapDispatchToProps)(QueryBuilder);
