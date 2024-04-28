import json
from datetime import datetime

import pandas as pd
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

    data = [
        (row.dimension_values[0].value, int(row.metric_values[0].value))
        for row in response.rows
    ]

    # Convert the data into a DataFrame
    df = pd.DataFrame(data, columns=["date", "active_users"])

    # Convert the date column to datetime
    df["date"] = pd.to_datetime(df["date"], format="%Y%m%d")

    # Create a date range for the last year
    start_date = datetime.strptime("2020-03-31", "%Y-%m-%d")
    end_date = datetime.strptime("2021-03-31", "%Y-%m-%d")
    date_range = pd.date_range(start_date, end_date)

    # Reindex the DataFrame to include all dates in the date range
    df.set_index("date", inplace=True)
    df = df.reindex(date_range, fill_value=0)

    # Reset the index
    df.reset_index(inplace=True)
    df.rename(columns={"index": "date"}, inplace=True)

    # Convert the DataFrame to a list of dictionaries
    data = df.to_dict("records")
    print(data)

    response_data = ActiveUsersPerDay(per_day=data)

    return response_data
