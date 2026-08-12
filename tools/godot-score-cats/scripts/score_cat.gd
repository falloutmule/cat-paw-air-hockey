extends Node2D

const PALETTES := {
	"player1": {
		"fur": Color("f4d6ae"), "marking": Color("efad8f"), "collar": Color("39b9b0"),
		"bell": Color("e6ad45"), "outline": Color("3b2945"), "muzzle": Color("fff0dc"), "cheek": Color("ec8d9e")
	},
	"player2": {
		"fur": Color("bba6df"), "marking": Color("d8c8ef"), "collar": Color("ee746d"),
		"bell": Color("e6ad45"), "outline": Color("3b2945"), "muzzle": Color("f3eaff"), "cheek": Color("ef8da5")
	}
}

@onready var rig: Node2D = $Rig
@onready var player: AnimationPlayer = $AnimationPlayer

func _ready() -> void:
	build_animations()
	sfhs_apply_variant("player1", {})

func sfhs_apply_variant(variant_id: String, _parameters: Dictionary) -> void:
	var selected: Dictionary = PALETTES.get(variant_id, PALETTES.player1)
	for child in rig.get_children():
		if child.has_method("set_palette"):
			child.set_palette(selected)

func value_track(animation: Animation, path: String, keys: Array, discrete := false) -> void:
	var track := animation.add_track(Animation.TYPE_VALUE)
	animation.track_set_path(track, NodePath(path))
	if discrete:
		animation.value_track_set_update_mode(track, Animation.UPDATE_DISCRETE)
	for pair in keys:
		animation.track_insert_key(track, pair[0], pair[1])

func animation(length: float) -> Animation:
	var result := Animation.new()
	result.length = length
	result.loop_mode = Animation.LOOP_NONE
	return result

func add_animation(library: AnimationLibrary, name: String, value: Animation) -> void:
	if library.has_animation(name):
		library.remove_animation(name)
	library.add_animation(name, value)

func build_animations() -> void:
	var library := AnimationLibrary.new()
	if player.has_animation_library(""):
		player.remove_animation_library("")
	player.add_animation_library("", library)

	var idle := animation(1.0)
	value_track(idle, "Rig:position", [[0.0, Vector2.ZERO], [1.0, Vector2.ZERO]])
	value_track(idle, "Rig/Head:blink", [[0.0, 0.0], [0.45, 1.0], [0.55, 0.0]], true)
	value_track(idle, "Rig/Head:expression", [[0.0, 0.0]], true)
	add_animation(library, "idle", idle)

	var goal := animation(0.9)
	value_track(goal, "Rig:position", [[0.0, Vector2.ZERO], [0.14, Vector2(0, -2)], [0.36, Vector2(0, -5)], [0.54, Vector2(0, -2)], [0.72, Vector2.ZERO]])
	value_track(goal, "Rig:rotation", [[0.0, 0.0], [0.36, -0.14], [0.54, 0.12], [0.72, 0.0]])
	value_track(goal, "Rig:scale", [[0.0, Vector2.ONE], [0.14, Vector2(1.10, 0.91)], [0.36, Vector2(0.95, 1.08)], [0.72, Vector2.ONE]])
	value_track(goal, "Rig/Head:expression", [[0.0, 2.0], [0.14, 1.0]], true)
	value_track(goal, "Rig/FrontPawLeft:position", [[0.0, Vector2(-20, -14)], [0.14, Vector2(-23, -27)], [0.36, Vector2(-24, -38)], [0.72, Vector2(-20, -14)]])
	value_track(goal, "Rig/FrontPawRight:position", [[0.0, Vector2(20, -14)], [0.14, Vector2(23, -28)], [0.36, Vector2(24, -38)], [0.72, Vector2(20, -14)]])
	value_track(goal, "Rig/Accents:accent_level", [[0.0, 0.0], [0.14, 0.5], [0.36, 1.0], [0.72, 0.0]], true)
	add_animation(library, "goal", goal)

	var conceded := animation(0.9)
	value_track(conceded, "Rig:position", [[0.0, Vector2.ZERO], [0.24, Vector2(-2, -2)], [0.34, Vector2(2, -1)], [0.72, Vector2.ZERO]])
	value_track(conceded, "Rig:rotation", [[0.0, 0.0], [0.24, -0.18], [0.34, 0.19], [0.72, -0.05]])
	value_track(conceded, "Rig:scale", [[0.0, Vector2(1.10, 0.90)], [0.24, Vector2(0.92, 1.08)], [0.72, Vector2(1.0, 0.93)]])
	value_track(conceded, "Rig/Head:expression", [[0.0, 2.0], [0.24, -2.0], [0.72, -1.0]], true)
	value_track(conceded, "Rig/Tail:rotation", [[0.0, 0.0], [0.24, -0.45], [0.34, 0.38], [0.72, -0.18]])
	value_track(conceded, "Rig/FrontPawLeft:position", [[0.0, Vector2(-20, -14)], [0.24, Vector2(-19, -27)], [0.72, Vector2(-20, -14)]])
	value_track(conceded, "Rig/FrontPawRight:position", [[0.0, Vector2(20, -14)], [0.24, Vector2(19, -27)], [0.72, Vector2(20, -14)]])
	value_track(conceded, "Rig/Accents:accent_level", [[0.0, 0.5], [0.24, 1.0], [0.72, 0.0]], true)
	add_animation(library, "conceded", conceded)

	var win := animation(1.2)
	value_track(win, "Rig:position", [[0.0, Vector2.ZERO], [0.16, Vector2(0, -3)], [0.34, Vector2(0, -5)], [0.52, Vector2(-2, -3)], [0.72, Vector2(2, -5)], [1.05, Vector2.ZERO]])
	value_track(win, "Rig:rotation", [[0.0, 0.0], [0.16, -0.10], [0.34, 0.06], [0.52, -0.11], [0.72, 0.11], [1.05, 0.0]])
	value_track(win, "Rig:scale", [[0.0, Vector2.ONE], [0.34, Vector2(0.94, 1.09)], [0.52, Vector2(1.05, 0.96)], [1.05, Vector2.ONE]])
	value_track(win, "Rig/Head:expression", [[0.0, 1.0]], true)
	value_track(win, "Rig/FrontPawLeft:position", [[0.0, Vector2(-20, -14)], [0.16, Vector2(-23, -28)], [0.34, Vector2(-24, -39)], [0.52, Vector2(-11, -30)], [0.72, Vector2(-24, -37)], [1.05, Vector2(-20, -14)]])
	value_track(win, "Rig/FrontPawRight:position", [[0.0, Vector2(20, -14)], [0.16, Vector2(23, -28)], [0.34, Vector2(24, -39)], [0.52, Vector2(11, -19)], [0.72, Vector2(24, -37)], [1.05, Vector2(20, -14)]])
	value_track(win, "Rig/Tail:rotation", [[0.0, 0.0], [0.34, 0.15], [0.52, -0.15], [0.72, 0.15], [1.05, 0.0]])
	value_track(win, "Rig/Accents:accent_level", [[0.0, 0.5], [0.16, 1.0], [0.72, 1.0], [1.05, 0.0]], true)
	add_animation(library, "win", win)

	var defeated := animation(1.0)
	value_track(defeated, "Rig:position", [[0.0, Vector2(0, 0)]])
	value_track(defeated, "Rig:rotation", [[0.0, -0.07]])
	value_track(defeated, "Rig:scale", [[0.0, Vector2(1.0, 0.92)]])
	value_track(defeated, "Rig/Head:expression", [[0.0, -2.0]], true)
	value_track(defeated, "Rig/Tail:rotation", [[0.0, -0.5]])
	value_track(defeated, "Rig/FrontPawLeft:rotation", [[0.0, -0.22]])
	value_track(defeated, "Rig/FrontPawRight:rotation", [[0.0, 0.22]])
	value_track(defeated, "Rig/Accents:accent_level", [[0.0, 0.5]], true)
	add_animation(library, "defeated", defeated)
