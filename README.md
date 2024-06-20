# AirlineSim Enhancement Suite

The AirlineSim Enhancement Suite (AES) offers a set of tools to help CEOs build their airlines.

## Features

- Aircraft profitability calculator
- A route analyser which shows load factors for routes
- A salary adjuster that uses the country average as a base
- Competitor monitoring software
- Easily see your route overview across with some analytics for the whole network.
- Automatically update prices to optimal levels.
- Automatically save historical load data.
- Customize most of the settings to fit your airline needs.

Marcipanas wrote [a guide](https://docs.google.com/document/d/1hzMHb3hTBXSZNtuDKoBuvx1HP9CgB7wVYR59yDYympg/) on how to use the extension’s features.

## Installation

Supported platforms: chromium based browsers (Chrome, Edge, etc).
This guide is based on [racsofp’s guide](https://forums.airlinesim.aero/t/manual-installation-of-the-ase-airlinesim-enhancement-suite-chrome-extension/24671).

1. Download the current version from the [releases](https://github.com/ZoeBijl/airlinesim-enhancement-suite/releases) site.
   The file you look for has the format AES.vX.X.X.zip where the _X_ is replaced with numbers. Example: AES.v0.6.8.zip
2. Unzip it.
3. Open your browser and go the expansion page.
    - Chrome: [chrome://extensions](chrome://extensions)
    - Edge: [edge://extensions](edge://extensions)
4. In the upper right corner is a slide bar that says _enable developer_. Enable it.
5. In the upper left should be a button that says _Load unpacked_. Click it.
6. Find the folder (unziped!) from part 2 and select it.

The extensions should be added, and you can enable it.

### Please note
Until AES is available on the chrome web store, this is a methode to install it directly.

## History

Marcipanas is the original developer of this extension.
It seems they ceased development sometime in 2020.
The community has published some updates in the meantime but no continued development has happened since.

Sources: the [original forum thread](https://forums.airlinesim.aero/t/introducing-airlinesim-enhancement-suite-beta/21684).

## Developer Features

These features make developing for AES easier.

### Notifications

AES comes with its own notification API. This uses AS’ notification style and location. The AES notification API consists of two components: `Notifications` and `Notification`.

#### Usage

Notifications should only be used as a response to an action by the user; don’t add notifications on page load.

#### Initiate the `Notifications`:

To start using the notification API create a new `Notifications`:

```
const notifications = new Notifications()
```

#### Add a new notification

To add a notification:

```
notifications.add("The settings have been updated")
```

By default a new notification comes with the success styling (a checkmark icon and a green background). The style can be changed by passing an options object:

```
notifications.new("Failed to save data", {type: "warning"})
```

The possible values for `type` are:
- `"success"`
- `"warning"`
- `"error"`

## Credits

- Marcipanas for the original development
- racsofp for their update and installation documentation
- Robert73 for the updated manifest file
- Zoë Bijl for the continued development
