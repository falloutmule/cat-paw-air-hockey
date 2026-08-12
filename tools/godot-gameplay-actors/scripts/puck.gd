extends Node2D

const CENTER := Vector2(32, 32)
const TIMES := [0.0, 0.08, 0.17, 0.28, 0.40, 0.52, 0.64]

var fill_color := Color("ffd45c")
var strand_color := Color("c36b32")
var accent_color := Color("fff4d6")
var highlight_color := Color("ffffff")
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
	fill_color = Color(String(parameters.get("fill", "ffd45c")))
	strand_color = Color(String(parameters.get("strand", "c36b32")))
	accent_color = Color(String(parameters.get("accent", "fff4d6")))
	highlight_color = Color(String(parameters.get("highlight", "ffffff")))
	queue_redraw()

func pose_value(values: Array[float]) -> float:
	return values[clampi(int(round(pose)), 0, values.size() - 1)]

func _draw() -> void:
	var scale_x := pose_value([1.0, 1.18, 0.84, 1.11, 0.92, 1.06, 0.97, 1.01])
	var scale_y := pose_value([1.0, 0.82, 1.18, 0.91, 1.10, 0.95, 1.04, 0.99])
	var twist := pose_value([0.0, -0.10, 0.12, -0.07, 0.05, -0.03, 0.015, 0.0])
	draw_set_transform(CENTER, twist, Vector2(scale_x, scale_y))
	draw_circle(Vector2(0, 2), 23.0, Color("07101870"), true, -1.0, false)
	draw_circle(Vector2.ZERO, 21.0, fill_color, true, -1.0, false)
	draw_arc(Vector2.ZERO, 14.0, -2.50, 0.72, 18, strand_color, 3.0, false)
	draw_arc(Vector2.ZERO, 10.0, -0.18, 2.82, 16, strand_color, 2.0, false)
	draw_polyline(PackedVector2Array([Vector2(-17, -4), Vector2(-8, -11), Vector2(0, 0), Vector2(8, 11), Vector2(17, 4)]), accent_color, 2.0, false)
	draw_circle(Vector2(-8, -10), 3.0, highlight_color, true, -1.0, false)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
