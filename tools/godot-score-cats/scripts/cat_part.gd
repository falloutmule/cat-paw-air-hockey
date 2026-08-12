extends Node2D

@export var part := "body"
@export var mirror := false
@export var blink := 0.0:
	set(value):
		blink = value
		queue_redraw()
@export var expression := 0.0:
	set(value):
		expression = value
		queue_redraw()
@export var accent_level := 0.0:
	set(value):
		accent_level = value
		queue_redraw()

var palette := {
	"fur": Color("f4d6ae"),
	"marking": Color("efad8f"),
	"collar": Color("39b9b0"),
	"bell": Color("e6ad45"),
	"outline": Color("3b2945"),
	"muzzle": Color("fff0dc"),
	"cheek": Color("ec8d9e")
}

func set_palette(next_palette: Dictionary) -> void:
	palette = next_palette.duplicate(true)
	queue_redraw()

func _notification(what: int) -> void:
	if what == NOTIFICATION_TRANSFORM_CHANGED:
		queue_redraw()

func polygon(points: PackedVector2Array, fill: Color, width := 2.0) -> void:
	draw_colored_polygon(points, fill)
	var closed := PackedVector2Array(points)
	closed.append(points[0])
	draw_polyline(closed, palette.outline, width, false)

func circle_at(center: Vector2, radius: float, fill: Color, outline := true) -> void:
	if outline:
		draw_circle(center, radius + 1.5, palette.outline, true, -1.0, false)
	draw_circle(center, radius, fill, true, -1.0, false)

func _draw() -> void:
	match part:
		"tail": draw_tail()
		"body": draw_body()
		"rear_paws": draw_rear_paws()
		"head": draw_head()
		"front_paw": draw_front_paw()
		"accents": draw_accents()

func draw_tail() -> void:
	var points := PackedVector2Array([Vector2(17, 4), Vector2(28, -3), Vector2(27, -14), Vector2(22, -20)])
	draw_polyline(points, palette.outline, 9.0, false)
	draw_polyline(points, palette.fur, 5.0, false)
	draw_circle(Vector2(22, -20), 2.5, palette.marking, true, -1.0, false)

func draw_body() -> void:
	polygon(PackedVector2Array([
		Vector2(-21, -8), Vector2(-17, -20), Vector2(-8, -28), Vector2(8, -28),
		Vector2(17, -20), Vector2(21, -8), Vector2(18, 10), Vector2(9, 16),
		Vector2(-9, 16), Vector2(-18, 10)
	]), palette.fur)
	polygon(PackedVector2Array([Vector2(-11, -15), Vector2(0, -22), Vector2(11, -15), Vector2(9, 2), Vector2(0, 8), Vector2(-9, 2)]), palette.marking, 1.5)
	draw_rect(Rect2(-18, -13, 36, 5), palette.outline, true)
	draw_rect(Rect2(-16, -12, 32, 3), palette.collar, true)
	circle_at(Vector2(0, -8), 3.2, palette.bell)

func draw_rear_paws() -> void:
	for x in [-12.0, 12.0]:
		circle_at(Vector2(x, 0), 7.0, palette.fur)
		draw_circle(Vector2(x, -1), 2.5, palette.marking, true, -1.0, false)

func draw_front_paw() -> void:
	var direction := -1.0 if mirror else 1.0
	polygon(PackedVector2Array([Vector2(-6, -9), Vector2(5, -9), Vector2(7, 8), Vector2(2, 13), Vector2(-5, 10), Vector2(-7, -2)]), palette.fur)
	draw_circle(Vector2(1 * direction, 8), 2.2, palette.marking, true, -1.0, false)

func draw_head() -> void:
	polygon(PackedVector2Array([
		Vector2(-24, -7), Vector2(-21, -22), Vector2(-19, -34), Vector2(-8, -25),
		Vector2(8, -25), Vector2(19, -34), Vector2(21, -22), Vector2(24, -7),
		Vector2(20, 12), Vector2(10, 20), Vector2(-10, 20), Vector2(-20, 12)
	]), palette.fur)
	polygon(PackedVector2Array([Vector2(-18, -25), Vector2(-17, -17), Vector2(-10, -23)]), palette.marking, 1.2)
	polygon(PackedVector2Array([Vector2(18, -25), Vector2(17, -17), Vector2(10, -23)]), palette.marking, 1.2)
	polygon(PackedVector2Array([Vector2(-9, -18), Vector2(0, -22), Vector2(9, -18), Vector2(7, -12), Vector2(-7, -12)]), palette.marking, 1.2)
	var eye_y := -5.0
	if blink >= 0.5:
		draw_line(Vector2(-13, eye_y), Vector2(-6, eye_y), palette.outline, 2.0, false)
		draw_line(Vector2(6, eye_y), Vector2(13, eye_y), palette.outline, 2.0, false)
	elif expression >= 1.5:
		circle_at(Vector2(-10, eye_y), 4.2, palette.muzzle)
		circle_at(Vector2(10, eye_y), 4.2, palette.muzzle)
		draw_circle(Vector2(-10, eye_y), 1.8, palette.outline, true, -1.0, false)
		draw_circle(Vector2(10, eye_y), 1.8, palette.outline, true, -1.0, false)
	elif expression <= -1.5:
		draw_line(Vector2(-14, -5), Vector2(-6, 0), palette.outline, 2.0, false)
		draw_line(Vector2(6, 0), Vector2(14, -5), palette.outline, 2.0, false)
	else:
		draw_circle(Vector2(-10, eye_y), 3.0, palette.outline, true, -1.0, false)
		draw_circle(Vector2(10, eye_y), 3.0, palette.outline, true, -1.0, false)
		draw_circle(Vector2(-9.4, eye_y - 0.7), 0.8, palette.muzzle, true, -1.0, false)
		draw_circle(Vector2(10.6, eye_y - 0.7), 0.8, palette.muzzle, true, -1.0, false)
		if expression >= 0.8:
			draw_circle(Vector2(-9.5, -3), 0.9, palette.muzzle, true, -1.0, false)
			draw_circle(Vector2(10.5, -3), 0.9, palette.muzzle, true, -1.0, false)
	for x in [-14.0, 14.0]:
		draw_circle(Vector2(x, 7), 2.6, palette.cheek, true, -1.0, false)
	polygon(PackedVector2Array([Vector2(-3, 5), Vector2(0, 8), Vector2(3, 5)]), palette.cheek, 1.0)
	if expression >= 0.8:
		draw_arc(Vector2(0, 9), 7, 0.15, PI - 0.15, 12, palette.outline, 2.0, false)
	elif expression <= -0.8:
		draw_arc(Vector2(0, 18), 7, PI + 0.15, TAU - 0.15, 12, palette.outline, 2.0, false)
	else:
		draw_line(Vector2(-4, 12), Vector2(0, 14), palette.outline, 1.5, false)
		draw_line(Vector2(0, 14), Vector2(4, 12), palette.outline, 1.5, false)

func draw_accents() -> void:
	if accent_level < 0.2:
		return
	var amount := 2 if accent_level < 0.8 else 4
	var positions := [Vector2(-29, -4), Vector2(29, -2), Vector2(-25, 13), Vector2(25, 15)]
	for index in range(amount):
		var point: Vector2 = positions[index]
		draw_line(point + Vector2(-3, 0), point + Vector2(3, 0), palette.bell, 2.0, false)
		draw_line(point + Vector2(0, -3), point + Vector2(0, 3), palette.bell, 2.0, false)
