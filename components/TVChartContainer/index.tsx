import * as React from "react";
import styles from "./index.module.css";
import {
  widget,
  version,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  IChartingLibraryWidget,
  ResolutionString,
} from "../../public/static/charting_library";

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions["symbol"];
  interval: ChartingLibraryWidgetOptions["interval"];

  // BEWARE: no trailing slash is expected in feed URL
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions["library_path"];
  chartsStorageUrl: ChartingLibraryWidgetOptions["charts_storage_url"];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions["charts_storage_api_version"];
  clientId: ChartingLibraryWidgetOptions["client_id"];
  userId: ChartingLibraryWidgetOptions["user_id"];
  fullscreen: ChartingLibraryWidgetOptions["fullscreen"];
  autosize: ChartingLibraryWidgetOptions["autosize"];
  studiesOverrides: ChartingLibraryWidgetOptions["studies_overrides"];
  container: ChartingLibraryWidgetOptions["container"];
}

export interface ChartContainerState {}

function getLanguageFromURL(): LanguageCode | null {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null
    ? null
    : (decodeURIComponent(results[1].replace(/\+/g, " ")) as LanguageCode);
}

export class TVChartContainer extends React.PureComponent<
  Partial<ChartContainerProps>,
  ChartContainerState
> {
  static defaultProps = {
    symbol: "AAPL",
    interval: "D",
    datafeedUrl: "https://demo_feed.tradingview.com",
    libraryPath: "/static/charting_library/",
    chartsStorageUrl: "https://saveload.tradingview.com",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  private tvWidget: IChartingLibraryWidget | null = null;
  private ref: React.RefObject<HTMLDivElement> = React.createRef();

  //   constructor(props) {
  //     super(props);

  //     this.ref = React.createRef();
  //   }

  componentDidMount() {
    if (!this.ref.current) {
      return;
    }

    const widgetOptions = {
      symbol: this.props.symbol as string,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
        this.props.datafeedUrl
      ),
      interval: this.props.interval,
      container: this.ref.current,
      library_path: this.props.libraryPath,

      locale: getLanguageFromURL() || "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: this.props.chartsStorageUrl,
      charts_storage_api_version: this.props.chartsStorageApiVersion,
      client_id: this.props.clientId,
      user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      studies_overrides: this.props.studiesOverrides,
    };

    const tvWidget = new widget(widgetOptions);
    this.tvWidget = tvWidget;

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute("title", "Click to show a notification popup");
        button.classList.add("apply-common-tooltip");
        button.addEventListener("click", () =>
          tvWidget.showNoticeDialog({
            title: "Notification",
            body: "TradingView Charting Library API works correctly",
            callback: () => {
              console.log("Noticed!");
            },
          })
        );

        button.innerHTML = "Check API";
      });
    });
  }

  componentWillUnmount() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  }

  render() {
    return (
      <>
        <header className={styles.VersionHeader}>
          <h1>
            TradingView Charting Library and Next.js Integration Example{" "}
            {version()}
          </h1>
        </header>
        <div ref={this.ref} className={styles.TVChartContainer} />
      </>
    );
  }
}
