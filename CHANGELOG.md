# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Removed

## 0.6.9 beta

### Added
- Added `CHANGELOG.md` (this file!) [#50](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/50)
- Added a Discord link to the AES menu [#53](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/53)
- Added installation guidance to the README [#2](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/2)
- Added support for `version_name` [#81](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/81)

### Changed
- Changed the logo [#37](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/37)
- Changed the way the AES menu is added to the UI [#79](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/79)

### Fixed
- Fixed an issue where negative integers were displayed as positive integers [#59](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/59)
- Fixed an issue where AES would throw an error [#65](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/65)

### Removed
- Removed status colour tweaks for dark mode [#56](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/56)


## [0.6.8] - 2024-06-09

### Added
- Added `AES.getDate()` helper function [#26](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/26)
- Format large numbers according to your localisation settings [#11](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/11)
- Improved legibility of status text in dark mode [#13](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/13)
- Added a menu with helpful links related to AES [#32](https://github.com/ZoeBijl/airlinesim-enhancement-suite/pull/32)
- Added an about screen with some basic info related to AES [#33](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/33)
- Added code validation in places as to prevent future UI changes breaking data
- Added CSS to hide empty aircraft manufacturing categories

### Changed
- Updated the AUTHORS file [#21](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/21)
- Ported some parts from jQuery to vanilla JavaScript
- Changed AES table styling to take up less horizontal space in some cases [#14](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/14)
- Changed the inventory page styling to make it easier to read [#25](https://github.com/ZoeBijl/airlinesim-enhancement-suite/pull/25)

### Fixed
- Fixed an issue where inventory pages wouldn’t close automatically [#17](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/17)
- Fixed an issue where the route management schedule couldn’t be updated [#16](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/16)
- Fixed an issue where no new data was written from the inventory pages [#25](https://github.com/ZoeBijl/airlinesim-enhancement-suite/pull/25)

### Removed
- Removed duplicate helper functions [#28](https://github.com/ZoeBijl/airlinesim-enhancement-suite/issues/28)

## [0.6.7] - 2024-05-05

### Added
- All currency values are now formatted according to the user’s localisation settings (ie. 3,000 AS$ / 3.000 AS$)
- Added a .editorconfig-file

### Fixed
- Fixed an issue where schedule extraction was shown as "NaN days ago" on the dashboard

## [0.6.6] - 2024-05-04

### Fixed
- Fixed an issue where the wrong UI element was queried for the server date

## [0.6.4] - 2020-07-01

_Last public release by Marcipanas_

### Added
- Aircraft Profitability - you can browse your fleet and see its profit
    - profit column is also added to Fleet Management page
    - each aircraft page has a summary of its profits

## 0.6.2 - 2020-06-24

### Fixed
- Personnel Management module will no longer get stuck in a loop when trying to set an amount higher/lower than is allowed by AirlineSim backend.
- Inventory Pricing module will not load if incorrect inventory settings are selected and will display error message for wrong settings. Required to load Inventory Pricing module:
    - All Flight Numbers tab selected
    - Apply settings to airport pair checked
    - Apply settings to flight numbers checked
    - Apply settings to return airport pair unchecked
    - Apply settings to return flight numbers unchecked
    - Service classes all checked
    - Flight status inflight and finished checked
    - Load minimum to 0% and max to 100%Flight status inflight and finished checked
    - Group by flight unchecked
- Inventory Pricing module history table would go out of the page bounds if there are many dates, now the table remains within the page with horizontal scroll bar.
- Inventory Pricing module history table now shows the most recent 5 or 10 dates if the option is selected instead of the oldest.

## 0.6.1 - 2020-06-22

### Added
- Competitor Monitoring - allows tracking other airlines

## 0.5.4 - 2020-05-13

### Fixed
- Personnel Management - clicking apply salary no longer fires any excess employees.

## 0.5.3 - 2020-05-12

### Added
- Personnel Management Module - allows to quickly change salary of your employees.

### Changed
- Route Management Dashboard - select first 50 changed to select first 10.
- Route Management Dashboard - open inventory button changes to max 10.
- Route Management Dashboard - added inventory button next to each row to open inventory page.
- General Dashboard - displays info on last personnel salary change date.

### Fixed
- Inventory Pricing and Analysis not working with German language (thanks to @derMaster1
for pointing it out).

## 0.5.2 - 2020-05-09

_First release._

[unreleased]: https://github.com/ZoeBijl/airlinesim-enhancement-suite/compare/v0.6.8...HEAD
[0.6.8]: https://github.com/ZoeBijl/airlinesim-enhancement-suite/compare/v0.6.7...v0.6.8
[0.6.7]: https://github.com/ZoeBijl/airlinesim-enhancement-suite/compare/v0.6.6...v0.6.7
[0.6.6]: https://github.com/ZoeBijl/airlinesim-enhancement-suite/compare/v0.6.5...v0.6.6
[0.6.5]: https://github.com/ZoeBijl/airlinesim-enhancement-suite/compare/v0.6.4...v0.6.5
[0.6.4]: https://github.com/ZoeBijl/airlinesim-enhancement-suite/releases/tag/v0.6.4
