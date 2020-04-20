
def player_distance(player1, player2):
    return ((player2['x'] - player1['x'])**2 + (player2['y'] - player1['y'])**2)**0.5

def distance_topos(object, x, y):
    return ((object['x'] - x) ** 2 + (object['y'] - y) ** 2) ** 0.5