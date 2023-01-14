<h1 align="center">
  <br />
  ✔️
  <br />
  Solv
  <sup>
    <br />
    <br />
  </sup>    
</h1>

<div align="center">
    <a href="https://www.npmjs.com/package/solv-cli">
        <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/async3619/solv?style=flat-square">
    </a>
    <a href="https://codecov.io/gh/async3619/solv">
        <img src="https://img.shields.io/codecov/c/github/async3619/solv/main?style=flat-square&token=9UAM0GA4VI" alt="codecov" />
    </a>
    <a href="https://github.com/async3619/solv/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/async3619/solv.svg?style=flat-square" alt="MIT License" />
    </a>
    <br />
    <sup>Hot-challenge-solving application for any coding challenge services.</sup>
    <br />
    <br />
</div>

## Introduction

Solv [sɑːlv] is a cli application for solving coding challenges with live updaing feature.

### Compatibility

| Name                                           | Support?             |
|------------------------------------------------|----------------------|
| [Baekjoon (acmicpc)](https://www.acmicpc.net/) | ✅                    |
| [Programmers](https://programmers.co.kr/)      | ⚠️ (Partially, WIP)  |
| [LeetCode](https://leetcode.com/)              | ⚠️ (Partially, WIP)  |

## Installation

```bash
$ npm install -g solv-cli
```

## Usage

```bash
Usage: solv [options] <url>

hot-challenge-solving application for any coding challenge services

Arguments:
  url                    specify a website url to solve

Options:
  -V, --version          output the version number
  --source, -s <source>  specify source code path to watch
  --config, -c <config>  specify configuration file path
  --no-transpile, -t     specify if program should not transpile source code
  --no-overwrite, -n     specify if program should not overwrite source code file
  --no-cache, -w         specify if program should not cache challenge information
  -h, --help             display help for command
```
