extends Node2D

const CENTER := Vector2(56, 56)
const TIMES := [0.0, 0.08, 0.17, 0.28, 0.40, 0.52, 0.64]

var fill_color := Color("f4d6ae")
var dark_color := Color("8f5d52")
var accent_color := Color("39b9b0")
var cream_color := Color("fff0dc")
var pose := 0.0:
	set(value):
		pose = value
		queue_redraw()

func make_animation(name: String, values: Array[float], length: float, loop: bool) -> Animation:
	var result := Animation.new()
	result.resource_name = name
	result.length = length
	result.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	var track := result.add_track(Animation.TYPE_VALUE)
	result.track_set_path(track, NodePath(".:pose"))
	result.value_track_set_update_mode(track, Animation.UPDATE_DISCRETE)
	for index in values.size():
		var time: float = 0.0 if values.size() == 1 else float(TIMES[index])
		result.track_insert_key(track, time, values[index])
	return result

func _ready() -> void:
	var library := AnimationLibrary.new()
	library.add_animation("idle", make_animation("idle", [0.0], 1.0, true))
	library.add_animation("contact", make_animation("contact", [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0], 0.64, false))
	$AnimationPlayer.add_animation_library("", library)
	queue_redraw()

func sfhs_apply_variant(_variant_id: String, parameters: Dictionary) -> void:
	fill_color = Color(String(parameters.get("fill", "f4d6ae")))
	dark_color = Color(String(parameters.get("dark", "8f5d52")))
	accent_color = Color(String(parameters.get("accent", "39b9b0")))
	cream_color = Color(String(parameters.get("cream", "fff0dc")))
	queue_redraw()

func pose_value(values: Array[float]) -> float:
	return values[clampi(int(round(pose)), 0, values.size() - 1)]

func ellipse(center: Vector2, radius: float, scale_value: Vector2, color: Color) -> void:
	draw_set_transform(center, 0.0, scale_value)
	draw_circle(Vector2.ZERO, radius, color, true, -1.0, false)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw() -> void:
	var pad_x := pose_value([1.0, 1.16, 0.88, 1.10, 0.94, 1.06, 0.98, 1.01])
	var pad_y := pose_value([1.0, 0.80, 1.18, 0.91, 1.08, 0.96, 1.03, 0.99])
	var spread := pose_value([0.0, 3.0, -2.0, 2.0, -1.0, 1.0, -0.5, 0.0])
	var toe_y := pose_value([0.0, 3.0, -2.0, 1.0, -1.0, 0.5, -0.5, 0.0])
	var pad_center := CENTER + Vector2(0, 10)
	var toe_centers := [
		CENTER + Vector2(-32 - spread, -15 + toe_y),
		CENTER + Vector2(-11 - spread * 0.35, -27 + toe_y),
		CENTER + Vector2(11 + spread * 0.35, -27 + toe_y),
		CENTER + Vector2(32 + spread, -15 + toe_y)
	]
	# Dark one-pixel-style underlay keeps the actor readable on the pink rug.
	ellipse(pad_center + Vector2(0, 2), 31.0, Vector2(pad_x, pad_y), dark_color)
	for toe in toe_centers:
		draw_circle(toe + Vector2(0, 2), 13.0, dark_color, true, -1.0, false)
	ellipse(pad_center, 28.5, Vector2(pad_x, pad_y), fill_color)
	for toe in toe_centers:
		draw_circle(toe, 11.0, fill_color, true, -1.0, false)
	# Cat-colored pad and toe beans mirror the corresponding score-cat palette.
	ellipse(pad_center + Vector2(0, 2), 16.0, Vector2(pad_x * 0.96, pad_y * 0.92), cream_color)
	for toe in toe_centers:
		draw_circle(toe, 5.0, accent_color, true, -1.0, false)
	draw_arc(pad_center + Vector2(0, 5), 11.0, 0.20, 2.94, 12, accent_color, 2.0, false)
