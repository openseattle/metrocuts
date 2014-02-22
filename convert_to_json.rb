require 'json'
require 'csv'

def clean_input(input)
	unless input.nil?
		return input.strip
	end
end

def get_state_for_route(route)
	if (route[:current_peak_am] == route[:proposed_peak_am]) &&
	   (route[:current_peak_pm] == route[:proposed_peak_pm]) &&
	   (route[:current_freq_peak] == route[:proposed_freq_peak]) &&
	   (route[:current_freq_midday] == route[:proposed_freq_midday]) &&
	   (route[:current_freq_night] == route[:proposed_freq_night]) &&
	   (route[:current_freq_sat] == route[:proposed_freq_sat]) &&
	   (route[:current_freq_sun] == route[:proposed_freq_sun]) &&
	   (route[:current_end_time] == route[:proposed_end_time]) &&
	   route[:summary].nil?
	   return :unchanged
	elsif route[:proposed_peak_am].nil? &&
	   route[:proposed_peak_pm].nil? &&
	   route[:proposed_freq_peak].nil? &&
	   route[:proposed_freq_midday].nil? &&
	   route[:proposed_freq_night].nil? &&
	   route[:proposed_freq_sat].nil? &&
	   route[:proposed_freq_sun].nil?
		return :deleted
	else
		return :changed
	end
end

routes = []
CSV.foreach("service-reduction-summary.csv") do |row|
	route = {
		route: clean_input(row[0]),
		route_description: "#{clean_input(row[1])} #{clean_input(row[2])}",
		current_peak_am: clean_input(row[3]),
		current_peak_pm: clean_input(row[4]),
		proposed_peak_am: clean_input(row[5]),
		proposed_peak_pm: clean_input(row[6]),
		current_freq_peak: clean_input(row[7]),
		current_freq_midday: clean_input(row[8]),
		current_freq_night: clean_input(row[9]),
		current_freq_sat: clean_input(row[10]),
		current_freq_sun: clean_input(row[11]),
		proposed_freq_peak: clean_input(row[12]),
		proposed_freq_midday: clean_input(row[13]),
		proposed_freq_night: clean_input(row[14]),
		proposed_freq_sat: clean_input(row[15]),
		proposed_freq_sun: clean_input(row[16]),
		current_end_time: clean_input(row[17]),
		proposed_end_time: clean_input(row[18]),
		summary: clean_input(row[19]),
		reduction_priority: clean_input(row[20]),
		reasons: clean_input(row[21]),
		rider_options: clean_input(row[22]),
	}

	route[:state] = get_state_for_route(route)

	routes << route
end

puts JSON.pretty_generate(routes)