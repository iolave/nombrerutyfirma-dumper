# NRYF Dumper - CLI tool to web scrap chileans personal information

![][BADGE-TEST-MAIN] ![][BADGE-BUILD-MAIN] ![][BADGE-BUILD-ART-MAIN] ![][BADGE-PUBLISH-MAIN]

## Disclaimer
NRYF Dumper is not affiliated by any means to the following information sources and it's creators: "elrutificador.com". The purpose of the code within this repository is only to query the already mentioned information sources without the need of a browser.

The author have no responsibility at all by the derived from the usage of this respository's code.

## Install
### Via npm
```
npm install -g nombrerutyfirma-dumper
```
### Using source code
```
git clone https://github.com/iolave/nombrerutyfirma-dumper.git
cd nombrerutyfirma-dumper
npm ci
npm run build
npm install -g .
```

## Usage
```
nryf-dumper --source=[source] --output=[output] [output options] [global options] [input options]
```

**Examples**
```shell
# ########################################
# Query a single rut and output to console
# ########################################
nryf-dumper --source=elrutificador --rut=123456 --output=console
# 2023-08-16T16:04:25.242Z [INFO]    elrutificador: data not found for rut 123.456-0

# ########################################
# Query multipe ruts and output to a file
# ########################################
nryf-dumper --source=elrutificador --ruts=123456,1234567 --output=local-file  --out-path=/tmp/results.json
# 2023-08-16T16:06:42.249Z [INFO]    elrutificador: data not found for rut 123.456-0, skipping
# 2023-08-16T16:06:44.252Z [INFO]    elrutificador: elrutificador: wrote found data for rut 1.234.567-4 to /tmp/results.json
```

### Available sources
- elrutificador.com: `elrutificador`

### Available outputs
- Console: `console`
- Local file: `local-file`
    - Required option: `--out-path=[path] # i.e. --out-path=/tmp/file.json`


### Available input options
- Single rut: `--rut=[rut without dv] # i.e. --rut=123456`
- Range of ruts: `--from-rut=[rut without dv] --to-rut=[rut without dv] # i.e. --from-rut=123450 --to-rut=123460`
- Multiple ruts: `--ruts=[...ruts without dv] # i.e. --ruts=123456,123457,123458`

### Global options
- Verbosity: `--verbose | --verbose=[number]`
- Batch size (for parallel requests): `--batch-size=[number] # i.e. --batch-size=10`

[BADGE-TEST-MAIN]: https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/wiki/iolave/nombrerutyfirma-dumper/test-main.md&logo=github
[BADGE-BUILD-MAIN]: https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/wiki/iolave/nombrerutyfirma-dumper/build-main.md&logo=github
[BADGE-BUILD-ART-MAIN]: https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/wiki/iolave/nombrerutyfirma-dumper/build-artifacts-main.md&logo=github
[BADGE-PUBLISH-MAIN]: https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/wiki/iolave/nombrerutyfirma-dumper/publish-main.md&logo=github