import json
from datetime import datetime, timedelta

import polars as pl
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)
from google.oauth2 import service_account

from api.config import Settings
from api.google_analytics.models import ActiveUsersPerDay


def get_active_users_per_day() -> ActiveUsersPerDay:
    credentials_json = json.loads(Settings.GA4_CREDENTIALS)
    credentials = service_account.Credentials.from_service_account_info(
        credentials_json
    )
    property_id = Settings.GA4_PROPERTY_ID
    client = BetaAnalyticsDataClient(credentials=credentials)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        # city, day, hostname, pagePath, data
        # dimensions=[Dimension(name="pagePath")],
        # # activeUsers, newUsers, active1DayUsers
        # metrics=[Metric(name="activeUsers")],
        # date_ranges=[
        #     DateRange(start_date="yesterday", end_date="today"),
        #     DateRange(start_date="7daysAgo", end_date="today"),
        #     DateRange(start_date="30daysAgo", end_date="today"),
        #     DateRange(start_date="365daysAgo", end_date="today"),
        # ],
        dimensions=[Dimension(name="date")],
        # activeUsers, newUsers, active1DayUsers
        metrics=[Metric(name="activeUsers")],
        date_ranges=[DateRange(start_date="365daysAgo", end_date="today")],
    )

    response = client.run_report(request)

    # Convert the data into a DataFrame
    df = pl.DataFrame(
        {
            "date": [row.dimension_values[0].value for row in response.rows],
            "active_users": [int(row.metric_values[0].value) for row in response.rows],
        }
    )

    # Convert the date column to datetime
    df = df.with_columns(df["date"].str.strptime(pl.Date, "%Y%m%d").alias("date"))

    # Create a date range for the last year
    end_date = datetime.now().date()
    date_range = [end_date - timedelta(days=i) for i in range(366, -1, -1)]

    # Convert the date range into a DataFrame
    date_df = pl.DataFrame({"date": date_range})

    # Join the data DataFrame and the date range DataFrame
    df = date_df.join(df, on="date", how="left")

    # Fill in missing values
    df = df.fill_null(0)

    # Sort the DataFrame by date
    json_data = df.rows(named=True)

    response_data = ActiveUsersPerDay(per_day=json_data)

    return response_data
