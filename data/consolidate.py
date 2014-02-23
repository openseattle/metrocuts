#! /usr/bin/env python

import json
import codecs
import argparse
from collections import OrderedDict



# data models

class Stop(dict):
    """Data for one bus stop."""

    @property
    def id(self):
        """ID."""
        return self['id']

    @property
    def lat(self):
        """Latitude."""
        return self['lat']

    @property
    def lon(self):
        """Longitude."""
        return self['lon']

    @property
    def route(self):
        """Route name."""
        return self['route']

    @property
    def period(self):
        """Route name."""
        return self['period']

class Route(dict):
    """Data for one bus route."""

    @property
    def name(self):
        return self['route']

    @property
    def current(self):
        return self['current']

    @property
    def proposed(self):
        return self['proposed']

    @property
    def delta(self):
        if self['current'] is None: return
        if self['proposed'] is None: return
        return self['proposed'] - self['current']



# data collections

class Stops(dict):
    """A collection mapping each stop ID to a list of Stop objects."""

    def add(self, dictionary):
        """Add one bus stop to the collection."""
        stop = Stop(dictionary)
        if stop.id in self:
            self[stop.id].append(stop)
        else:
            self[stop.id] = [stop]

    def summarize(self, id, routes):
        """Summarize the given stop, using the given routes collection."""
        summary = OrderedDict([
            ('id', id),
            ('lat', None),
            ('lon', None),
            ('current', []),
            ('proposed', []),
            ('delta', []),
        ])
        for stop in self[id]:
            route_summary = routes.summarize(stop.route)
            summary['lat'] = stop.lat
            summary['lon'] = stop.lon
            if route_summary['delta'] is not None:
                summary['current'].append(route_summary['current'])
                summary['proposed'].append(route_summary['proposed'])
                summary['delta'].append(route_summary['delta'])
        summary['current_routes'] = self._current_routes(id, routes)
        summary['proposed_routes'] = self._proposed_routes(id, routes)
        summary['current'] = _mean(summary['current'])
        summary['proposed'] = _mean(summary['proposed'])
        summary['delta'] = _mean(summary['delta'])
        return summary

    def _current_routes(self, id, routes):
        """Find current routes for the given stop."""
        current_routes = set()
        for stop in self[id]:
            for route in routes.get(stop.route, []):
                if route.current is not None:
                    current_routes.add(stop.route)
        return sorted(current_routes)

    def _proposed_routes(self, id, routes):
        """Find current and proposed routes."""
        proposed_routes = set()
        for stop in self[id]:
            for route in routes.get(stop.route, []):
                if route.proposed is not None:
                    proposed_routes.add(stop.route)
        return sorted(proposed_routes)

class Routes(dict):
    """A collection mapping each route name to a list of Route objects."""

    def add(self, dictionary):
        """Add one bus route to the collection."""
        route = Route(dictionary)
        if route.name in self:
            self[route.name].append(route)
        else:
            self[route.name] = [route]

    def summarize(self, name):
        """Summarize average current, proposed, delta for the given route."""
        summary = OrderedDict([
            ('route', name),
            ('current', []),
            ('proposed', []),
            ('delta', []),
        ])
        for route in self.get(name, []):
            if route.delta is not None:
                summary['current'].append(route.current)
                summary['proposed'].append(route.proposed)
                summary['delta'].append(route.delta)
        summary['current'] = _mean(summary['current'])
        summary['proposed'] = _mean(summary['proposed'])
        summary['delta'] = _mean(summary['delta'])
        return summary



# data consolidation scripts

def _mean(array):
    """Find the mean of an array of floats."""
    if array:
        return float(sum(array)) / len(array)

def _read(filename):
    """Read file, removing BOM if necessary."""
    return str(codecs.open(filename, 'r', 'utf-8').read().lstrip(u'\ufeff'))

def consolidate(stopsfile, routesfile, outputfile):
    """Consolidate stops and routes."""
    # import stops
    stops = Stops()
    for dictionary in json.loads(_read(stopsfile)):
        stops.add(dictionary)
    # import routes
    routes = Routes()
    for dictionary in json.loads(_read(routesfile)):
        routes.add(dictionary)
    # export consolidated output
    summaries = []
    for id in stops:
        summary = stops.summarize(id, routes)
        if summary['current_routes']:
            summaries.append(summary)
    json.dump(summaries, open(outputfile, 'w'), indent=2, separators=(',', ': '))

if __name__ == '__main__':
    parser = argparse.ArgumentParser("Consolidate routes and stops JSON files")
    parser.add_argument('stops', help="file path to stops.json (try 'stops_data.json')")
    parser.add_argument('routes', help="file path to routes.json (try 'routes.json')")
    parser.add_argument('output', help="file path to output.json (try 'heatmap.json')")
    args = parser.parse_args()
    consolidate(args.stops, args.routes, args.output)
