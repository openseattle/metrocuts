require 'json'

def get_period_from_range(input)
	if input.nil? || input == "-"
		return nil
	end

	input_range = input.split("-")
	if input_range.size == 2
		return (input_range[0].to_i + input_range[1].to_i)/2
	else
		return input_range[0].to_i
	end
end

routes = JSON.parse(IO.read(ARGV[0]), opts = {symbolize_names: true})
periods = []
routes.each do |route|
	period_pairs = [
		{period: :peak, current: route[:current_freq_peak], proposed: route[:proposed_freq_peak]},
		{period: :midday, current: route[:current_freq_midday], proposed: route[:proposed_freq_midday]},
		{period: :night, current: route[:current_freq_night], proposed: route[:proposed_freq_night]},
		{period: :saturday, current: route[:current_freq_sat], proposed: route[:proposed_freq_sat]},
		{period: :sunday, current: route[:current_freq_sun], proposed: route[:proposed_freq_sun]}
	]

	period_pairs.each do |pair|
		period = {
			route: route[:route],
			state: route[:state],
			period: pair[:period]
		}
		
		if pair[:period] == :peak
			current_value = get_period_from_range(pair[:current])
			if current_value.nil?
				peak_am = route[:current_peak_am].to_i
				peak_pm = route[:current_peak_pm].to_i
				average_peak = (peak_am + peak_pm)/2
				current_value = 240 / average_peak unless average_peak == 0
			end
			period[:current] = current_value
			if route[:state] == "deleted"			
				period[:proposed] = nil
			else
				proposed_value = get_period_from_range(pair[:proposed])
				if proposed_value.nil?
					peak_am = route[:proposed_peak_am].to_i
					peak_pm = route[:proposed_peak_pm].to_i
					average_peak = (peak_am + peak_pm)/2
					proposed_value = 240 / average_peak unless average_peak == 0
				end
				period[:proposed] = proposed_value
			end
		else
			period[:current] = get_period_from_range(pair[:current])
			if route[:state] == "deleted"			
				period[:proposed] = nil
			else
				period[:proposed] = get_period_from_range(pair[:proposed])
			end
		end
		
		periods << period
	end
end

puts JSON.pretty_generate(periods)